import * as React from "react";
import { RouteComponentProps } from 'react-router-dom';
import { DataTable, DropdownInput, Error, Modal, Spinner } from 'quill-component-library/dist/componentLibrary';
import { ActivityInterface, ActivityRouteProps, FlagInterface } from '../../../interfaces/comprehensionInterfaces';
import ActivityForm from './activityForm';
import { blankActivity, flagOptions } from '../../../../../constants/comprehension';
import { getCookie } from '../../../../../helpers/comprehension';
import useSWR from 'swr';

const ActivitySettings: React.FC<RouteComponentProps<ActivityRouteProps>> = ({ match }) => {
  const [activity, setActivity] = React.useState<ActivityInterface>(blankActivity);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string>(null);
  const [activityFlag, setActivityFlag] = React.useState<FlagInterface>(null);
  const [originalFlag, setOriginalFlag] = React.useState<FlagInterface>(null);
  const [showEditActivityModal, setShowEditActivityModal] = React.useState<boolean>(false)
  const [showEditFlagModal, setShowEditFlagModal] = React.useState<boolean>(false)
  const { params } = match;
  const { activityId } = params;
  const activityAPI = `https://comprehension-247816.appspot.com/api/activities/${activityId}.json`
  
  const fetchData = async () => {
    let activity: ActivityInterface;
    try {
      setLoading(true);
      const response = await fetch(activityAPI);
      activity = await response.json();
    } catch (error) {
      setError(error);
      setLoading(false);
    }
    const { flag } = activity
    const flagObject = { label: flag, value: flag };
    setActivity(activity);
    setOriginalFlag(flagObject);
    setActivityFlag(flagObject);
    setLoading(false);
    return activity;
  };

  // cache activity data to access activity prompts for regex configuration
  useSWR("activity", fetchData);

  React.useEffect(() => {
    fetchData();
  }, []);

  const submitActivity = async (activity: ActivityInterface) => {
    let updatedActivity: ActivityInterface;
    const csrftoken = getCookie('csrftoken');
    try {
      setLoading(true);
      const response = await fetch(activityAPI, {
        method: "PUT",
        credentials: 'include',
        body: JSON.stringify(activity),
        headers: {
          "Accept": "application/JSON",
          "Content-Type": "application/json",
          'X-CSRFToken': csrftoken
        },
      });
      updatedActivity = await response.json();
    } catch (error) {
      setError(error);
      setLoading(false);
    }
    toggleEditActivityModal();
  }

  const handleUpdateFlag = () => {
    // TODO: hook into Activity PUT API for updating only the development status (as requested by curriculum)
    setShowEditFlagModal(false);
  }

  const handleFlagChange = (flag: { label: string, value: {}}) => {
    setActivityFlag(flag);
  }


  const toggleEditActivityModal = () => {
    setShowEditActivityModal(!showEditActivityModal);
  }

  const toggleFlagModal = () => {
    // only update flag if submit button is clicked
    if(activityFlag !== originalFlag) {
      setActivityFlag(originalFlag);
    }
    setShowEditFlagModal(!showEditFlagModal);
  }

  const flagModal = (
    <button className="quill-button fun primary outlined" id="edit-flag-button" onClick={toggleFlagModal} type="submit">
      {activityFlag ? activityFlag.label : ''}
    </button>
  );

  const renderActivityForm = () => {
    return(
      <Modal>
        <ActivityForm activity={activity} closeModal={toggleEditActivityModal} submitActivity={submitActivity} />
      </Modal>
    );
  }

  const renderFlagEditModal = () => {
    return(
      <Modal>
        <div className="edit-flag-container">
          <div className="close-button-container">
            <button className="quill-button fun primary contained" id="flag-close-button" onClick={toggleFlagModal} type="submit">x</button>
          </div>
          <DropdownInput
            className="flag-dropdown"
            handleChange={handleFlagChange}
            isSearchable={true}
            label="Development Stage"
            options={flagOptions}
            value={activityFlag}
          />
          <div className="submit-button-container">
            <button className="quill-button fun primary contained" id="flag-submit-button" onClick={handleUpdateFlag} type="submit">
              Submit
            </button>
            <button className="quill-button fun primary contained" id="flag-cancel-button" onClick={toggleFlagModal} type="submit">
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    )
  }

  const generalSettingsRows = (activity: ActivityInterface) => {
    // format for DataTable to display labels on left side and values on right
    const { passages, prompts, title } = activity
    const fields = [
      { 
        label: 'Title',
        value: title 
      },
      {
        label: 'Development Stage',
        value: flagModal
      },
      {
        label: 'Passage Length',
        value: passages && passages[0] ? `${passages[0].text.split(' ').length} words` : null
      },
      {
        label: "Because",
        value: prompts && prompts[0] ? prompts[0].text : null
      },
      {
        label: "But",
        value: prompts && prompts[1] ? prompts[1].text : null
      },
      {
        label: "So",
        value: prompts && prompts[2] ? prompts[2].text : null
      },
    ];
    return fields.map(field => {
      const { label, value } = field
      return {
        field: label,
        value
      }
    });
  }

  if(loading) {
    return(
      <div className="loading-spinner-container">
        <Spinner />
      </div>
    );
  }

  if(error) {
    return(
      <div className="error-container">
        <Error error={`${error}`} />
      </div>
    );
  }

  // The header labels felt redundant so passing empty strings and hiding header display
  const dataTableFields = [
    { name: "", attribute:"field", width: "200px" }, 
    { name: "", attribute:"value", width: "400px" }
  ];

  return(
    <div className="activity-settings-container">
      {showEditActivityModal && renderActivityForm()}
      {showEditFlagModal && renderFlagEditModal()}
      <DataTable
        className="activity-general-settings-table"
        headers={dataTableFields}
        rows={generalSettingsRows(activity)}
      />
      <div className="button-container">
        <button className="quill-button fun primary contained" id="edit-activity-button" onClick={toggleEditActivityModal} type="submit">Configure</button>
      </div>
    </div>
  );
}

export default ActivitySettings;
