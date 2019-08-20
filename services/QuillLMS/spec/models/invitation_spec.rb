require 'rails_helper'

RSpec.describe Invitation, type: :model do
  let(:teacher) { create(:teacher_with_a_couple_classrooms_with_one_student_each) }

  describe 'validations' do

    it 'should downcase invitee email before saving' do
      invitee_email = 'ANGRY@example.com'
      invite = Invitation.create(invitee_email: invitee_email, inviter: teacher, invitation_type: Invitation::TYPES[:coteacher])
      expect(invite.invitee_email).to eq(invitee_email.downcase) 
    end

    it 'should error if the user has reached their daily limit of invitations' do
      # Stub the limit to 1 so that we don't have to create 50 test records just to test this
      stub_const("Invitation::MAX_COTEACHER_INVITATIONS_PER_TIME", 1)
      Invitation::MAX_COTEACHER_INVITATIONS_PER_TIME.times { |i|
        Invitation.create(invitee_email: 'test#{i}@example.com', inviter: teacher, invitation_type: Invitation::TYPES[:coteacher])
      }
      expect{Invitation.create(invitee_email: 'error@example.com', inviter: teacher, invitation_type: Invitation::TYPES[:coteacher])}.to raise_error(StandardError)
    end

  end
end
