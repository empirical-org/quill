require 'rails_helper'

describe AccountsController, type: :controller do
  it { should use_before_filter :signed_in! }
  it { should use_before_filter :set_cache_buster }

  let(:user) { create(:user) }

  before do
    allow(controller).to receive(:current_user) { user }
  end

  describe '#new' do
    before do
      session[:role] = "something"
    end

    it 'should kick off the background job, set the session values and variables' do
      get :new, redirect: "www.test.com"
      expect(session[:role]).to eq nil
      expect(session[:post_sign_up_redirect]).to eq "www.test.com"
      expect(assigns(:teacherFromGoogleSignUp)).to eq false
      expect(assigns(:js_file)).to eq "session"
    end
  end

  describe '#role' do
    context 'when role is student or teacher' do
      it 'should set the js_file and role in session' do
        post :role, role: "student"
        expect(session[:role]).to eq "student"

        post :role, role: "teacher"
        expect(session[:role]).to eq "teacher"
      end
    end

    context 'when role is not student or teacher' do
      it 'should set the js file but not the role in session' do
        post :role, role: "not student or teacher"
        expect(session[:role]).to eq nil
      end
    end
  end

  describe '#create' do
    context 'when user found' do
      let!(:another_user) { create(:user) }

      before do
        session[:temporary_user_id] = another_user.id
      end

      context 'when user is saved' do
        let(:callbacks) { double(:callbacks, trigger: true) }

        before do
          allow(CompleteAccountCreation).to receive(:new) { callbacks }
        end

        it 'should kick off the account creation callback' do
          expect(callbacks).to receive(:trigger)
          post :create, user: { classcode: "code", email: "test@test.com", password: "test123", role: "student" }
        end

        it 'should subscribe the user to the newsletter' do
          expect_any_instance_of(User).to receive(:subscribe_to_newsletter)
          post :create, user: { classcode: "code", email: "test@test.com", password: "test123", role: "student" }
        end

        context 'when user is a teacher and affliate tag present' do
          context 'when referrer user id found' do
            let!(:referrer) { ReferrerUser.create(referral_code: "some code", user: user) }

            before do
              allow(user).to receive(:teacher?) { true }
              request.env["affiliate.tag"] = "some code"
            end

            it 'should create the referralsuser' do
              post :create, user: { classcode: "code", email: "test@test.com", password: "test123", role: "teacher" }
              expect(ReferralsUser.last.user_id).to eq user.id
              expect(ReferralsUser.last.referred_user_id).to eq another_user.id
            end
          end
        end

        context 'when post sign up redirect present' do
          before do
            session[:post_sign_up_redirect] = "www.test.com"
          end

          it 'should render the json' do
            post :create, user: { classcode: "code", email: "test@test.com", password: "test123", role: "student" }
            expect(response.body).to eq({
              redirectPath: "www.test.com"
            }.to_json)
            expect(session[:post_sign_up_redirect]).to eq nil
          end
        end

        context 'when post sign up redirect not present' do
          context 'when user has outstanding coteacher invitation' do
            before do
              allow_any_instance_of(User).to receive(:has_outstanding_coteacher_invitation?) { true }
            end

            it 'should render the teachers classroom path json' do
              post :create, user: { classcode: "code", email: "test@test.com", password: "test123", role: "student" }
              expect(response.body).to eq({redirectPath: teachers_classrooms_path}.to_json)
            end
          end

          context 'when user has no outstanding coteacher invitation' do
            it 'should render the user' do
              post :create, user: { classcode: "code", email: "test@test.com", password: "test123", role: "user" }
              expect(response.body).to eq(another_user.reload.serialized.to_json)
            end
          end
        end
      end

      context 'when user is not saved' do
        it 'should render the errors json' do
          post :create, user: { classcode: "code", email: "test", role: "user" }
          expect(response.status).to eq 422
          expect(response.body).to eq({errors: {email: ["does not appear to be a valid e-mail address"]}}.to_json)
        end
      end
    end
  end

  describe '#update' do
    context 'user got updated' do
      it 'should redirect to updated_account_path' do
        post :update, user: { email: "new@email.com" }
        expect(response).to redirect_to root_path
      end
    end

    context 'user did not get updated' do
      it 'should render accounts edit' do
        post :update, user: { email: "new" }
        expect(response).to render_template "accounts/edit"
      end
    end
  end

  describe '#edit' do
    it 'should set the user' do
      get :edit
      expect(assigns(:user)).to eq user
    end
  end
end
