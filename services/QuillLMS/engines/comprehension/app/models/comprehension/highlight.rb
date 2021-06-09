module Comprehension
  class Highlight < ActiveRecord::Base
    include Comprehension::ChangeLog

    MIN_TEXT_LENGTH = 1
    MAX_TEXT_LENGTH = 5000
    TYPES= [
      'passage',
      'response',
      'prompt'
    ]

    belongs_to :feedback, inverse_of: :highlights

    validates :text, presence: true, length: {minimum: MIN_TEXT_LENGTH, maximum: MAX_TEXT_LENGTH}
    validates :highlight_type, presence: true, inclusion: {in: TYPES}
    validates :starting_index, numericality: {only_integer: true, greater_than_or_equal_to: 0}

    # after_create :log_creation
    # after_destroy :log_deletion
    # after_update :log_update, if: :text_changed?
    # after_update :log_first_update, if: -> {semantic_rule && first_order && text_changed?}
    # after_update :log_second_update, if: -> {semantic_rule && second_order && text_changed?}

    def serializable_hash(options = nil)
      options ||= {}

      super(options.reverse_merge(
        only: [:id, :feedback_id, :text, :highlight_type, :starting_index]
      ))
    end

    private def semantic_rule
      feedback.rule.rule_type == Rule::TYPE_AUTOML
    end

    private def first_order
      feedback.order == 0
    end

    private def second_order
      feedback.order == 1
    end

    private def change_text(change_index)
      "#{feedback&.rule&.label&.name} | #{feedback&.rule&.name}\n#{text_change[change_index]}"
    end

    private def log_creation
      feedback&.rule&.log_update({highlight: text})
    end

    private def log_deletion
      feedback&.rule&.log_update({highlight: nil}, {highlight: text})
    end

    # private def log_update
    #   feedback&.rule&.log_update({highlight: text_change[1]}, {highlight: text_change[0]})
    # end

    def log_update(user_id, prev_value)
      if semantic_rule && first_order
        feedback&.rule&.prompts&.each do |prompt|
          log_change(user_id, :update_highlight_1, prompt, nil, nil, prev_value, "#{feedback.rule.label.name} | #{feedback.rule.name}\n#{text}")
        end
      elsif semantic_rule && second_order
        feedback&.rule&.prompts&.each do |prompt|
          log_change(user_id, :update_highlight_2, prompt, nil, nil, prev_value, "#{feedback.rule.label.name} | #{feedback.rule.name}\n#{text}")
        end
      end
    end
  end
end
