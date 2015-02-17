module MailchimpConnection
  def subscribe_to_newsletter(email)
    connection = Mailchimp::API.new(ENV['MAILCHIMP_API_KEY'])
    connection.lists.subscribe('eadf6d8153',     # id
                               { email: email }, # email
                               nil,              # merge_vars
                               'html',           # email_type
                               false,            # double_optin
                               false,            # update_existing
                               true,             # replace_interests
                               false)            # send_welcome
  end

  extend self
end
