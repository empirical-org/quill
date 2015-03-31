class Classroom < ActiveRecord::Base
  GRADES = %w(1 2 3 4 5 6 7 8 9 10 11 12 University)

  validates_uniqueness_of :code
  validates_uniqueness_of :name, scope: :teacher_id
  validates :grade, presence: true
  validates_presence_of :name


  has_many :units do
    def create_next
      create(name: "Unit #{@association.owner.units.count + 1}")
    end
  end

  has_many :classroom_activities
  has_many :activities, through: :classroom_activities
  has_many :activity_sessions, through: :classroom_activities
  has_many :sections, through: :activities

  has_many :students, -> { where role: 'student' }, foreign_key: 'classcode', class_name: 'User', primary_key: 'code'
  belongs_to :teacher, class_name: 'User'

  before_validation :generate_code, if: Proc.new {|c| c.code.blank?}


  def x
    c = self
    if teacher.present?
      "#{c.id},#{c.name},#{c.code},#{c.teacher.name},#{c.teacher.email},#{teacher.ip_address}"
    else
      "#{c.id},#{c.name},#{c.code},,,"
    end
  end

  # TODO: REMOVE ME. This is for the old progress report.
  def self.for_standards_progress_report(teacher, filters)
    with(filtered_activity_sessions: ActivitySession.proficient_sessions_for_progress_report(teacher, filters))
      .select("classrooms.name as name, classrooms.id as id")
      .joins('JOIN classroom_activities ON classroom_activities.classroom_id = classrooms.id')
      .joins('JOIN filtered_activity_sessions ON filtered_activity_sessions.classroom_activity_id = classroom_activities.id')
      .group("classrooms.id")
      .order("classrooms.name asc")
  end

  def self.for_standards_report(teacher, filters)
    with(user_info: User.for_standards_report(teacher, filters))
      .select(<<-SQL
        classrooms.name as name,
        classrooms.id as id,
        classrooms.teacher_id,
        COUNT(DISTINCT(user_info.id)) as total_student_count,
        SUM(CASE WHEN user_info.average_score >= 0.75 THEN 1 ELSE 0 END) as proficient_student_count,
        SUM(CASE WHEN user_info.average_score >= 0.50 AND user_info.average_score < 0.75 THEN 1 ELSE 0 END) as near_proficient_student_count,
        SUM(CASE WHEN user_info.average_score < 0.50 THEN 1 ELSE 0 END) as not_proficient_student_count
      SQL
      )
      .joins(:students)
      .joins('INNER JOIN user_info ON user_info.id = users.id')
      .order("classrooms.name asc")
      .group("classrooms.id")
  end

  def unique_topic_count
    filters = {}
    ActivitySession.from_cte('best_activity_sessions', ActivitySession.for_standards_report(teacher, filters))
      .select("COUNT(DISTINCT(activities.topic_id)) as topic_count")
      .joins('JOIN activities ON activities.id = best_activity_sessions.activity_id')
      .joins('JOIN classroom_activities ON classroom_activities.id = best_activity_sessions.classroom_activity_id')
      .where('classroom_activities.classroom_id = ?', id)
      .group('classroom_activities.classroom_id')
      .order('')
      .first.topic_count
  end

  def self.setup_from_clever(section)
    c = Classroom.where(clever_id: section.id).includes(:units).first_or_initialize

    c.update_attributes(
      name: section.name,
      teacher: User.teacher.where(clever_id: section.teacher).first,
      grade: section.grade
    )
    c.units.create_next if c.units.empty?

    c
  end

  def classroom_activity_for activity
    classroom_activities.where(activity_id: activity.id).first
  end


  def generate_code
    self.code = NameGenerator.generate
    if Classroom.find_by_code(code) then generate_code end
  end

end
