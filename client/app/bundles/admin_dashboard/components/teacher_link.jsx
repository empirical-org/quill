import React from 'react';

const TeacherLink = ({ name, path, isValid, }) => {
  let linkClass = 'green-link teacher-link';
  let alertText = 'Your Premium Subscription has expired. Please visit ' +
    'Quill.org/premium to access this feature.'

  if (isValid || true) {
    return(
      <div>
        <a className={linkClass} href={path} target="_blank">{name}</a>
      </div>
    );
  }
  return(
    <div>
      <a className={linkClass} onClick={() => alert(alertText)}>{link.name}</a>
    </div>
  );
};

export default TeacherLink;
