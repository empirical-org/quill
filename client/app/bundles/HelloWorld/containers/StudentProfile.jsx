import React from 'react';
import StudentsClassroomsHeader from '../components/student_profile/students_classrooms/students_classrooms_header.jsx';
import NextActivity from '../components/student_profile/next_activity.jsx';
import StudentProfileUnits from '../components/student_profile/student_profile_units.jsx';
import StudentProfileHeader from '../components/student_profile/student_profile_header';
import Pusher from 'pusher-js';
import { connect } from 'react-redux';
import { fetchStudentProfile, fetchStudentsClassrooms, updateNumberOfClassroomTabs, handleClassroomClick } from '../../../actions/student_profile';

const StudentProfile = React.createClass({
  componentDidMount() {
    window.addEventListener('resize', () => {
      this.props.updateNumberOfClassroomTabs(window.innerWidth);
    });
    this.props.updateNumberOfClassroomTabs(window.innerWidth);
    this.props.fetchStudentProfile();
    this.props.fetchStudentsClassrooms();
  },

  componentWillUnmount() {
    window.removeEventListener('resize');
  },

  componentDidUpdate() {
    this.initializePusher();
  },

  handleClassroomTabClick(classroomId) {
    if (!this.props.loading) {
      this.props.handleClassroomClick(classroomId);
      this.props.fetchStudentProfile(classroomId);
    }
  },

  initializePusher() {
    const classroomId = this.props.student.classroom.id;

    if (process.env.NODE_ENV === 'development') {
      Pusher.logToConsole = true;
    }
    const pusher = new Pusher(process.env.PUSHER_KEY, { encrypted: true, });
    const channel = pusher.subscribe(classroomId.toString());
    const that = this;
    channel.bind('lesson-launched', () => {
      that.props.fetchStudentProfile(classroomId);
    });
  },

  render() {
    if (!this.props.loading) {
      return (
        <div id="student-profile">
          <StudentsClassroomsHeader handleClassroomTabClick={this.handleClassroomTabClick}/>
          <StudentProfileHeader studentName={this.props.student.name} classroomName={this.props.student.classroom.name} teacherName={this.props.student.classroom.teacher.name} />
          <NextActivity data={this.props.nextActivitySession} loading={this.props.loading} hasActivities={this.props.scores.length > 0} />
          <StudentProfileUnits data={this.props.scores} loading={this.props.loading} />
        </div>
      );
    } return <span />;
  },
});

const mapStateToProps = (state) => { return state };
const mapDispatchToProps = dispatch => ({
  fetchStudentProfile: classroomId => dispatch(fetchStudentProfile(classroomId)),
  updateNumberOfClassroomTabs: (screenWidth) => dispatch(updateNumberOfClassroomTabs(screenWidth)),
  fetchStudentsClassrooms: () => dispatch(fetchStudentsClassrooms()),
  handleClassroomClick: (classroomId) => dispatch(handleClassroomClick(classroomId)),

});

export default connect(mapStateToProps, mapDispatchToProps)(StudentProfile);
