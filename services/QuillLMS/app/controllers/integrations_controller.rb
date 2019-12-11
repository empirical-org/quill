class IntegrationsController < ApplicationController
  include HTTParty
  layout "integrations"

  def amplify
    store_partner_session()
    @body_class = 'full-width-page white-page'
    @js_file = 'public'
    @active_tab = 'Featured Activities'
    @partner_content = PartnerContent.amplify.only_unit_templates.includes(:content).order(:order)
  end

  def amplify_all
    @body_class = 'full-width-page white-page'
    @js_file = 'public'
    @active_tab = 'Explore All Activities'
    @section = params[:section_id].present? ? Section.find(params[:section_id]) : Section.first
    @topics = @section.topics.map{ |topic| [topic, topic.activities.production] }.select{ |group| group.second.any? }
    render :template => 'integrations/amplify'
  end

  def store_partner_session
    # Assumes that each partner gets a unique action corresponding to their name
    @partner_name = action_name
    @session_id = params[:session_id]
    session[:partner_session] = {
      "partner_name" => @partner_name,
      "session_id" => @session_id
    }
  end

end
