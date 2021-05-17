# Usage: TeacherActivityFeed.add(teacher_id, activity_session_id)
# Usage: TeacherActivityFeed.get(teacher_id)
class TeacherActivityFeed < RedisFeed
  KEY = 'teacher-activity-feed-'
  LIMIT = 40

  def key
    KEY
  end

  def limit
    LIMIT
  end

  def hydrate(ids:)
    sessions = ActivitySession
      .includes(:user, :activity, :classification, :classroom_unit)
      .where(id: ids)

    # purposely avoiding the SQL sort on the large activity_sessions table
    sessions.sort_by(&:completed_at).reverse.map do |session|
      {
        id: session.id,
        student_name: session.user.name,
        activity_name: session.activity.name,
        unit_id: session.classroom_unit.unit_id,
        classroom_id: session.classroom_unit.classroom_id,
        user_id: session.user_id,
        activity_id: session.activity_id,
        score: text_for_score(session.classification.key, session.percentage),
        completed: text_for_completed(session.completed_at)
      }
    end
  end

  # PUSHER_EVENT = 'teacher-activity-feed'
  def callback_on_add(id_or_ids)
    # TODO: add pusher code for real time updates
    # hydrate(ids: id_or_ids).each do |session_hash|
    #   PusherTrigger.run(key_id, PUSHER_EVENT, session_hash)
    # end
  end

  private def text_for_score(key, percentage)
    return '' unless percentage

    if [ActivityClassification::DIAGNOSTIC_KEY, ActivityClassification::LESSONS_KEY].include?(key)
      ActivitySession::COMPLETED
    elsif percentage >= ProficiencyEvaluator.proficiency_cutoff
      ActivitySession::PROFICIENT
    elsif percentage >= ProficiencyEvaluator.nearly_proficient_cutoff
      ActivitySession::NEARLY_PROFICIENT
    else
      ActivitySession::NOT_YET_PROFICIENT
    end
  end

  private def text_for_completed(completed_at)
    return '' unless completed_at

    now = Time.now().in_time_zone.utc
    diff = (now - completed_at).round.abs

    minutes = diff / 60
    hours = minutes / 60
    days = hours / 24

    if minutes <= 59
      "#{minutes} #{'min'.pluralize(minutes)} ago"
    elsif hours <= 23
      "#{hours} #{'hour'.pluralize(hours)} ago"
    elsif days <= 6
      "#{days} #{'day'.pluralize(days)} ago"
    elsif completed_at.year == now.year
      completed_at.strftime("%b #{completed_at.day.ordinalize}")
    else
      completed_at.strftime("%b #{completed_at.day.ordinalize}, %Y")
    end
  end
end
