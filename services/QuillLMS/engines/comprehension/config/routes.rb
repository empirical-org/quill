Comprehension::Engine.routes.draw do
  resources :rules, only: [:index, :show, :create, :update, :destroy]

  resources :activities, only: [:index, :show, :create, :update, :destroy] do
    member do
      get :rules
    end
  end

  resources :turking_round_activity_sessions, only: [:index, :show, :create, :update, :destroy]
  resources :turking_rounds, only: [:index, :show, :create, :update, :destroy]


  post 'feedback/plagiarism' => 'feedback#plagiarism'
  post 'feedback/regex/:rule_type' => 'feedback#regex'

end
