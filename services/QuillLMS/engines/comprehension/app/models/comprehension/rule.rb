module Comprehension
  class Rule < ActiveRecord::Base
    include Comprehension::ChangeLog

    attr_accessor :first_feedback

    MAX_NAME_LENGTH = 250
    ALLOWED_BOOLEANS = [true, false]
    STATES = [
      STATE_ACTIVE = 'active',
      STATE_INACTIVE = 'inactive'
    ]
    TYPES= [
      TYPE_AUTOML = 'autoML',
      TYPE_GRAMMAR = 'grammar',
      TYPE_OPINION = 'opinion',
      TYPE_PLAGIARISM = 'plagiarism',
      TYPE_REGEX_ONE = 'rules-based-1',
      TYPE_REGEX_TWO = 'rules-based-2',
      TYPE_REGEX_THREE = 'rules-based-3',
      TYPE_SPELLING = 'spelling'
    ]
    DISPLAY_NAMES = {
      'rules-based-1': 'Sentence Structure Regex',
      'rules-based-2': 'Post-Topic Regex',
      'rules-based-3': 'Typo Regex',
      'plagiarism': 'Plagiarism'
    }
    UPDATE_ACTIONS = {
      'rules-based-1': :update_regex,
      'rules-based-2': :update_regex,
      'rules-based-3': :update_regex,
      'plagiarism': :update_plagiarism,
      'spelling': :update_universal,
      'grammar': :update_universal,
      'autoML': :update_semantic
    }

    after_create :assign_to_all_prompts, if: :universal
    after_create :log_creation
    after_update :log_update
    after_destroy :log_deletion
    before_validation :assign_uid_if_missing
    validate :one_plagiarism_per_prompt, on: :create, if: :plagiarism?

    has_many :feedbacks, inverse_of: :rule, dependent: :destroy
    has_one :plagiarism_text, inverse_of: :rule, dependent: :destroy
    has_one :label, inverse_of: :rule, dependent: :destroy
    has_many :prompts_rules, inverse_of: :rule
    has_many :prompts, through: :prompts_rules, inverse_of: :rules
    has_many :regex_rules, inverse_of: :rule, dependent: :destroy
    has_many :change_logs

    accepts_nested_attributes_for :plagiarism_text
    accepts_nested_attributes_for :feedbacks
    accepts_nested_attributes_for :label
    accepts_nested_attributes_for :regex_rules

    validates :uid, presence: true, uniqueness: true
    validates :name, presence: true, length: {maximum: MAX_NAME_LENGTH}
    validates :universal, inclusion: ALLOWED_BOOLEANS
    validates :optimal, inclusion: ALLOWED_BOOLEANS
    validates :rule_type, inclusion: {in: TYPES}
    validates :state, inclusion: {in: STATES}
    validates :suborder, numericality: {allow_blank: true, only_integer: true, greater_than_or_equal_to: 0}

    def serializable_hash(options = nil)
      options ||= {}

      super(options.reverse_merge(
        only: [:id, :uid, :name, :note, :universal, :rule_type, :optimal, :state, :suborder, :concept_uid, :prompt_ids],
        include: [:plagiarism_text, :feedbacks, :label, :regex_rules],
        methods: [:prompt_ids, :display_name]
      ))
    end

    def determine_feedback_from_history(feedback_history)
      relevant_history = feedback_history.filter { |fb| fb['feedback_type'] == rule_type }
      relevant_feedback_text = relevant_history.map { |fb| fb['feedback'] }

      first_unused = feedbacks.where.not(text: relevant_feedback_text).order(:order).first
      return first_unused || feedbacks.order(order: :desc).first
    end

    def regex_is_passing?(entry)
      return true if regex_rules.empty?
      if regex_rules.first.incorrect_sequence?
        all_regex_rules_passing?(entry)
      else
        at_least_one_regex_rule_passing?(entry)
      end
    end

    def display_name
      DISPLAY_NAMES[rule_type.to_sym] || rule_type
    end

    private def all_regex_rules_passing?(entry)
      regex_rules.none? do |regex_rule|
        regex_rule.entry_failing?(entry)
      end
    end

    private def at_least_one_regex_rule_passing?(entry)
      regex_rules.any? do |regex_rule|
        !regex_rule.entry_failing?(entry)
      end
    end

    def plagiarism?
      rule_type == TYPE_PLAGIARISM
    end

    def regex?
      rule_type == TYPE_REGEX_ONE || rule_type == TYPE_REGEX_TWO || rule_type == TYPE_REGEX_THREE
    end

    def automl?
      rule_type == TYPE_AUTOML
    end

    def universal_rule_type?
      rule_type == TYPE_SPELLING || rule_type == TYPE_GRAMMAR
    end

    def universal?
      universal
    end

    def url
      if regex?
        regex_url
      elsif universal?
        universal_url
      elsif plagiarism?
        plagiarism_url
      elsif automl?
        automl_url
      else
        ""
      end
    end

    private def assign_uid_if_missing
      self.uid ||= SecureRandom.uuid
    end

    private def assign_to_all_prompts
      Prompt.all.each do |prompt|
        unless prompts.include?(prompt)
          prompts.append(prompt)
        end
      end
      save!
    end

    private def one_plagiarism_per_prompt
      prompts.each do |prompt|
        errors.add(:prompts, "prompt #{prompt.id} already has a plagiarism rule") if prompt.rules.where(rule_type: TYPE_PLAGIARISM).first&.id
      end
    end

    private def log_creation
      if regex?
        log_change(nil, :create_regex, self, {url: url}.to_json, nil, nil, nil)
      elsif plagiarism?
        log_change(nil, :create_plagiarism, self, {url: url}.to_json, nil, nil, nil)
      elsif universal?
        log_change(nil, :create_universal, self, {url: url}.to_json, nil, nil, nil)
      elsif automl?
        log_change(nil, :create_semantic, self, {url: url}.to_json, nil, nil, nil)
      end
    end

    private def log_deletion
      if regex?
        prompts.each do |prompt|
          log_change(nil, :delete_regex, prompt, {url: url, name: name}.to_json, nil, nil, nil)
        end
      elsif automl?
        prompts.each do |prompt|
          log_change(nil, :delete_semantic, prompt, {url: url, name: name}.to_json, nil, nil, nil)
        end
      end
    end

    private def log_update
      return if id_changed? || rule_type == TYPE_OPINION
      changes.except("updated_at".to_sym).each do |key, value|
        log_change(nil, UPDATE_ACTIONS[rule_type.to_sym], self, {url: url}.to_json, key, value[0], value[1])
      end
    end

    private def activity_id
      prompts&.first&.activity&.id
    end

    private def prompt_id
      prompts&.first&.id
    end

    private def universal_url
      "comprehension/#/universal-rules/#{id}"
    end

    private def regex_url
      "comprehension/#/activities/#{activity_id}/regex-rules/#{id}"
    end

    private def plagiarism_url
      "comprehension/#/activities/#{activity_id}/plagiarism-rules/#{id}"
    end

    private def automl_url
      "comprehension/#/activities/#{activity_id}/semantic-labels/#{prompt_id}/#{id}"
    end
  end
end
