import React from 'react';
import request from 'request';
import Units from './manage_units/units';
import LoadingIndicator from '../shared/loading_indicator';
import ItemDropdown from '../general_components/dropdown_selectors/item_dropdown';

export default class ClassroomLessons extends React.Component {
  constructor(props) {
    super();

    this.state = {
      allLessons: [],
      lessons: [],
      classrooms: this.getClassrooms(),
      loaded: false,
      selectedClassroomId: `${props.routeParams.classroomId}`,
      lessonUidsWithEditions: []
    };
  }

  getClassrooms = () => {
    const { routeParams, } = this.props
    request.get(`${process.env.DEFAULT_URL}/teachers/classrooms_i_teach_with_lessons`, (error, httpStatus, body) => {
      const classrooms = JSON.parse(body).classrooms;
      if (classrooms.length > 0) {
        this.setState({ classrooms, selectedClassroomId: routeParams.classroomId || `${classrooms[0].id}`, }, () => this.getAllLessons());
      } else {
        this.setState({ empty: true, loaded: true, });
      }
    });
  }

  getAllLessons = () => {
    request.get({
      url: `${process.env.DEFAULT_URL}/teachers/lesson_units`,
    }, (error, httpStatus, body) => {
      this.setState({ allLessons: JSON.parse(body), }, () => this.getLessonsForCurrentClass());
    });
  }

  getLessonsForCurrentClass = () => {
    const { allLessons, selectedClassroomId, } = this.state
    const lessonsInCurrentClassroom = _.reject(allLessons, lesson => lesson.classroom_id !== selectedClassroomId);
    this.setState({ lessons: lessonsInCurrentClassroom}, () => this.getLessonsWithEditions());
  }

  getLessonsWithEditions = () => {
    const { classrooms, } = this.state
    const teacherId = classrooms[0].teacher_id
    request.get(`${process.env.FIREBASE_DATABASE_URL}/v2/lessons_editions.json`, (error, httpStatus, body) => {
      const editions = JSON.parse(body)
      const lessonUidsWithEditions = []
      if (editions) {
        Object.keys(editions).forEach(e => {
          const edition = editions[e]
          if (edition.user_id === teacherId && lessonUidsWithEditions.indexOf(edition.lesson_id) === -1) {
            lessonUidsWithEditions.push(edition.lesson_id)
          }
        })
      }
      this.setState({lessonUidsWithEditions: lessonUidsWithEditions, loaded: true})
    })
  }

  renderHeader() {
    /* eslint-disable react/jsx-no-target-blank */
    const paragraphWithLinks = <p>Before you launch a lessons activity with your students, we recommend you check out<a href={`${process.env.DEFAULT_URL}/tutorials/lessons/1`} target="_blank">this tutorial</a> on how to lead a lesson. We have also put together a <a href="https://support.quill.org/using-quill-tools/quill-lessons/getting-started-how-to-set-up-your-first-quill-lesson" target="_blank">comprehensive guide</a> that will explain how to set up lessons in your classroom.</p>
    /* eslint-enable react/jsx-no-target-blank */

    return (<div className="my-lessons-header">
      <h1>Launch Lessons</h1>
      {paragraphWithLinks}
      <p><span>Note:</span> If you want to re-do a lesson with your class, re-assign the lesson then launch it.</p>
    </div>);
  }

  renderFeedbackNote() {
    return (<div className="feedback-note">
      We would love to hear about your experience with Quill Lessons. Please share your feedback by filling out this <a href="https://goo.gl/forms/podicVxtfRR8CVVO2" rel="noopener noreferrer" target="_blank">short feedback form</a>.
    </div>)
  }

  renderEmptyState() {
    return (<div className="empty-lessons manage-units">
      <div className="content">
        <h1>You have no lessons assigned!</h1>
        <p>In order to launch a lesson, you need to assign a lesson to one of your classes.</p>
        <p>With Quill Lessons, teachers can use Quill to lead whole-class lessons and to see and display student responses in real-time.</p>
        <div className="buttons">
          <a className="bg-quillgreen text-white" href="/teachers/classrooms/assign_activities/create-unit?tool=lessons" target="_blank">Assign Lessons</a>  // eslint-disable-line react/jsx-no-target-blank
          <a className="bg-white text-quillgreen" href="/tools/lessons" target="_blank">Learn More</a> // eslint-disable-line react/jsx-no-target-blank
        </div>
      </div>
      <img src={`${process.env.CDN_URL}/images/illustrations/empty_state_illustration_lessons.svg`} />
    </div>);
  }

  switchClassrooms = (classroom) => {
    const { router, } = this.props
    router.push(`${process.env.DEFAULT_URL}/teachers/classrooms/activity_planner/lessons/${classroom.id}`);
    this.setState({ selectedClassroomId: `${classroom.id}`, }, () => this.getLessonsForCurrentClass());
  }

  generateNewCaUnit(u) {
    const { lessonUidsWithEditions, } = this.state
    const {
      number_of_assigned_students,
      class_size,
      class_name,
      unit_id,
      unit_created_at,
      unit_name,
      activity_id,
      activity_name,
      activity_uid,
      unit_activity_created_at,
      classroom_unit_id,
      unit_activity_id,
      activity_classification_id,
      classroom_id,
      owned_by_current_user,
      due_date,
      supporting_info,
      completed,
      started_count,
      owner_name,
    } = u
    const studentCount = Number(number_of_assigned_students || class_size)
    const hasEditions = lessonUidsWithEditions.indexOf(activity_uid) !== -1
    const caObj = {
      studentCount: studentCount,
      classrooms: new Set([class_name]),
      classroomActivities: new Map(),
      unitId: unit_id,
      unitCreated: unit_created_at,
      unitName: unit_name,
    };
    caObj.classroomActivities.set(activity_id, {
      name: activity_name,
      activityId: activity_id,
      activityUid: activity_uid,
      created_at: unit_activity_created_at,
      cuId: classroom_unit_id,
      uaId: unit_activity_id,
      activityClassificationId: activity_classification_id,
			classroomId: classroom_id,
      dueDate: due_date,
      supportingInfo: supporting_info,
      completed,
      studentCount,
      started: started_count > 0,
      hasEditions: hasEditions,
      ownedByCurrentUser: owned_by_current_user === 't',
      ownerName: owner_name
    });
    return caObj;
  }

  parseUnits(data) {
    const { lessonUidsWithEditions, } = this.state
    const parsedUnits = {};
    data.forEach((u) => {
      const {
        number_of_assigned_students,
        class_size,
        class_name,
        unit_id,
        unit_created_at,
        unit_name,
        activity_id,
        activity_name,
        activity_uid,
        unit_activity_created_at,
        classroom_unit_id,
        unit_activity_id,
        activity_classification_id,
        classroom_id,
        owned_by_current_user,
        due_date,
        supporting_info,
        completed,
        started_count,
        owner_name,
      } = u
      if (!parsedUnits[unit_id]) {
        // if this unit doesn't exist yet, go create it with the info from the first ca
        parsedUnits[unit_id] = this.generateNewCaUnit(u);
      } else {
        const caUnit = parsedUnits[unit_id];
        const hasEditions = lessonUidsWithEditions.indexOf(activity_uid) !== -1
        const studentCount = Number(number_of_assigned_students ? number_of_assigned_students : class_size)
        if (!caUnit.classrooms.has(class_name)) {
          // add the info and student count from the classroom if it hasn't already been done
          caUnit.classrooms.add(class_name);
          caUnit.studentCount += studentCount;
        }
        // add the activity info if it doesn't exist
        caUnit.classroomActivities.set(activity_id,
          caUnit.classroomActivities[activity_id] || {
          name: activity_name,
          activityId: activity_id,
          activityUid: activity_uid,
          created_at: unit_activity_created_at,
          cuId: classroom_unit_id,
          uaId: unit_activity_id,
          activityClassificationId: activity_classification_id,
          classroomId: classroom_id,
          dueDate: due_date,
          supportingInfo: supporting_info,
          completed,
          studentCount,
          started: started_count > 0,
          hasEditions: hasEditions,
          ownedByCurrentUser: owned_by_current_user === 't',
          ownerName: owner_name
        });
      }
    });
    return this.orderUnits(parsedUnits);
  }

  orderUnits(units) {
    const unitsArr = [];
    Object.keys(units).forEach(unitId => unitsArr.push(units[unitId]));
    return unitsArr;
  }

  render() {
    const { empty, loaded, classrooms, lessons, selectedClassroomId, } = this.state
    if (empty) {
      return this.renderEmptyState();
    } else if (loaded) {
      return (
        <div id="lesson_planner">
          <div className="container my-lessons manage-units">
            {this.renderHeader()}
            <ItemDropdown
              callback={this.switchClassrooms}
              items={classrooms}
              selectedItem={classrooms.find(classy => classy.id === selectedClassroomId)}
            />
            <Units
              data={this.parseUnits(lessons)}
              lesson
            />
            {this.renderFeedbackNote()}
          </div>
        </div>);
    }
    return <LoadingIndicator />;
  }
}
