module CleverIntegration::Importers::Library

  def self.run(auth_hash, user_type)
    begin
      client = CleverLibrary::Api::Client.new(auth_hash.credentials.token)
      user = self.import_teacher(client)
      if auth_hash[:info][:user_type] == 'teacher'
        classrooms = self.import_classrooms(client, user.clever_id)
        CleverIntegration::Associators::ClassroomsToTeacher.run(classrooms, user)
        CleverLibraryStudentImporterWorker.perform_async(classrooms.map(&:id), auth_hash.credentials.token)
      elsif auth_hash[:info][:user_type] == 'school_admin'
        schools = self.import_schools(client, user.clever_id)
      end
      return {type: 'user_success', data: teacher}
    end
  rescue
    {type: 'user_failure', data: "Error: " + $!.message}
  end

  def self.import_teacher(client)
    teacher_id = client.get_user()["id"]
    teacher_data = client.get_teacher(teacher_id: teacher_id)
    CleverIntegration::Creators::Teacher.run(
      email: teacher_data["email"],
      name: "#{teacher_data['name']['first']} #{teacher_data['name']['middle']} #{teacher_data['name']['last']}".squish,
      clever_id: teacher_data["id"]
    )
  end

  def self.import_classrooms(client, teacher_id)
    classrooms_data = client.get_teacher_sections(teacher_id: teacher_id)
    CleverIntegration::Creators::Classrooms.run(classrooms_data.map{|classroom| {clever_id: classroom["id"], name: classroom["name"], grade: classroom["grade"]} })
  end

  def self.import_schools(client, user_id)
    schools_data = client.get_school_admin_schools(school_admin_id: user_id)
    schools = schools_data.map do |school|
      CleverIntegration::Creators::Schools.run(school)
    end
    schools.each { |school| SchoolsAdmins.create(school_id: school.id, user_id: user_id)}
  end

end
