class PagesController < ApplicationController
  before_filter :resolve_layout

  def home
    @body_id = 'home'
    @chapter = Chapter.first
    @assessment = @chapter.assessment
  end

  def develop
    @body_class = 'white-page'
  end

  def mission
    @body_class = 'white-page'
  end

  def democracy_in_america
    @video_id = '48eoUKalprw'
  end

  def aggregation
    @video_id = '3lcqTp2A750'
  end

  private

  def resolve_layout
    case action_name
    when 'about', 'learning', 'story'
      @body_class = 'auxilliary'
    end
  end
end
