import * as React from 'react'
import { requestGet, requestPut, requestPost, } from '../../../../../modules/request/index'
import CustomActivityPackPage from '../../../../Teacher/components/assignment_flow/create_unit/custom_activity_pack/index'

const ActivityCategories = () => {
  const [activityCategories, setActivityCategories] = React.useState([])
  const [selectedActivityCategoryId, setSelectedActivityCategoryId] = React.useState(null)
  const [selectedActivities, setSelectedActivities] = React.useState([])
  const [activities, setActivities] = React.useState([])

  React.useEffect(() => {
    getActivityCategories()
    getActivities()
  }, [])

  React.useEffect(() => {
    if (selectedActivityCategoryId === null) {
      setSelectedActivities([])
    } else {
      const selectedActivityCategory = activityCategories.find(ac => ac.id === selectedActivityCategoryId)
      const selectedActivityCategoryActivities = selectedActivityCategory.activity_ids.map(id => activities.find(a => a.id === id))
      setSelectedActivities(selectedActivityCategoryActivities)
    }
  }, [selectedActivityCategoryId])

  React.useEffect(() => {
    if (!selectedActivityCategoryId) { return }

    const selectedActivityIds = selectedActivities.map(a => a.id)
    const newActivityCategories = [...activityCategories]
    const indexOfActivityCategory = newActivityCategories.findIndex(act => act.id === selectedActivityCategoryId);
    newActivityCategories[indexOfActivityCategory].activity_ids = selectedActivityIds
    setActivityCategories(newActivityCategories)
  }, [selectedActivities])

  function getActivityCategories() {
    requestGet('/cms/activity_categories',
      (data) => {
        setActivityCategories(data.activity_categories);
      }
    )
  }

  function getActivities() {
    requestGet('/activities/search',
      (data) => {
        setActivities(data.activities);
      }
    )
  }

  function handleActivityCategorySelect(activityCategoryId) {
    setSelectedActivityCategoryId(activityCategoryId)
  }

  function toggleActivitySelection(activity) {
    const indexOfActivity = selectedActivities.findIndex(act => act.id === activity.id);
    const newActivityArray = selectedActivities.slice();
    if (indexOfActivity === -1) {
      newActivityArray.push(activity);
    } else {
      newActivityArray.splice(indexOfActivity, 1);
    }
    setSelectedActivities(newActivityArray)
  }

  function handleSelectedActivityReorder(reorderedActivities) {
    // handles the case where the selected activities are filtered by flag - we don't want to remove hidden activities from the list so we just put them at the end of the new order
    const hiddenSelectedActivities = selectedActivities.filter(sa => !reorderedActivities.find(ra => ra.id === sa.id))
    setSelectedActivities(reorderedActivities.concat(hiddenSelectedActivities))
  }

  const activityCategoryEditorProps = {
    activityCategories,
    getActivityCategories,
    setActivityCategories,
    selectedActivityCategoryId,
    handleActivityCategorySelect
  }

  return (<CustomActivityPackPage
    activityCategoryEditor={activityCategoryEditorProps}
    clickContinue={() => {}}
    isStaff={true}
    passedActivities={activities}
    selectedActivities={selectedActivities}
    setSelectedActivities={handleSelectedActivityReorder}
    toggleActivitySelection={toggleActivitySelection}
  />)
}

// export default class ActivityCategory extends React.Component {
//   constructor(props) {
//     super(props)
//
//     this.state = {
//       selectedActivities: props.activities
//     }
//   }
//
//   function destroyAndRecreateOrderNumbers(activities) {
//     requestPost(`${process.env.DEFAULT_URL}/cms/activity_categories/destroy_and_recreate_acas`, {
//       activities: activities,
//       activity_category_id: that.props.activity_category.id
//     }, (e, r, response) => {
//         if (e) {
//           alert(`We could not save the updated activity order. Here is the error: ${e}`)
//         } else {
//           this.setState({selectedActivities: response.activities})
//           alert('The updated activity order has been saved.')
//         }
//       }
//     )
//   };
//
//   toggleActivitySelection = activity => {
//     const newSelectedActivities = this.state.selectedActivities
//     const activityIndex = newSelectedActivities.findIndex(a => a.id === activity.id)
//     if (activityIndex === -1) {
//       const activityWithOrderNumber = Object.assign({}, activity)
//       activityWithOrderNumber.order_number = newSelectedActivities.length
//       newSelectedActivities.push(activityWithOrderNumber)
//     } else {
//       newSelectedActivities.splice(activityIndex, 1)
//     }
//     this.setState({selectedActivities: newSelectedActivities})
//   };
//
//   updateActivityOrder = newSelectedActivities => {
//     const { selectedActivities, } = this.state
//     const newOrder = newSelectedActivities.map(item => item.id);
//     const newOrderedActivities = newOrder.map((key, i) => {
//       const newActivity = selectedActivities.find(a => a.id === key)
//       newActivity.order_number = i
//       return newActivity
//     })
//     this.setState({selectedActivities: newOrderedActivities})
//   };
//
//   render() {
//     return(<div>
//       <CustomActivityPackPage
//         clickContinue={this.destroyAndRecreateOrderNumbers}
//         selectedActivities={this.state.selectedActivities}
//         setSelectedActivities={this.updateActivityOrder}
//         toggleActivitySelection={this.toggleActivitySelection}
//       />
//     </div>
//   )
//   }
// }

export default ActivityCategories
