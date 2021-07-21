require("rails_helper")
module Comprehension
  RSpec.describe(Prompt, :type => :model) do
    context("relations") do
      it { should belong_to(:activity) }
      it { should have_many(:automl_models) }
      it { should have_many(:prompts_rules) }
      it { should have_many(:rules).through(:prompts_rules) }
    end
    context("validations") do
      it { should validate_presence_of(:activity) }
      it { should validate_inclusion_of(:max_attempts).in_array([3, 4, 5, 6]) }
      it { should validate_presence_of(:text) }
      it { should validate_presence_of(:conjunction) }
      it { should validate_inclusion_of(:conjunction).in_array(["because", "but", "so"]) }
      context("#validate_prompt_length") do
        it("not allow a prompt to be created that is too short") do
          activity = create(:comprehension_activity)
          prompt = build(:comprehension_prompt, :conjunction => "but", :text => "too short", :max_attempts => 5, :activity_id => activity.id)
          expect((not prompt.valid?)).to(be_truthy)
          expect(prompt.errors[:text].include?("#{prompt.conjunction} prompt too short (minimum is #{Prompt::MIN_TEXT_LENGTH} characters)")).to(eq(true))
        end
        it("not allow a prompt to be created that is too long") do
          activity = create(:comprehension_activity)
          prompt_text = "And both that morning equally lay In leaves no step had trodden black. Oh, I kept the first for another day! Yet knowing how way leads on to way, I doubted if I should ever come back. I shall be telling this with a sigh Somewhere ages and ages hence: Two roads diverged in a wood, and I\u2014 I took the one less traveled by, And that has made all the difference."
          prompt = build(:comprehension_prompt, :conjunction => "because", :text => prompt_text, :max_attempts => 5, :activity_id => activity.id)
          expect((not prompt.valid?)).to(be_truthy)
          expect(prompt.errors[:text].include?("#{prompt.conjunction} prompt too long (maximum is #{Prompt::MAX_TEXT_LENGTH} characters)")).to(eq(true))
        end
      end
    end
    context("#after_create") do
      context("#assign_universal_rules") do
        it("assign all universal rules to new prompts") do
          rule1 = create(:comprehension_rule, :universal => true)
          rule2 = create(:comprehension_rule, :universal => true)
          prompt = create(:comprehension_prompt)
          expect(2).to(eq(prompt.rules.length))
          expect(prompt.rules.include?(rule1)).to(eq(true))
          expect(prompt.rules.include?(rule2)).to(eq(true))
        end
        it("not duplicate rule assignments if some exist already") do
          rule1 = create(:comprehension_rule, :universal => true)
          rule2 = create(:comprehension_rule, :universal => true)
          prompt = create(:comprehension_prompt, :rules => ([rule1]))
          expect(2).to(eq(prompt.rules.length))
          expect(prompt.rules.include?(rule1)).to(eq(true))
          expect(prompt.rules.include?(rule2)).to(eq(true))
        end
        it("not add non-universal rules") do
          universal_rule = create(:comprehension_rule, :universal => true)
          non_universal_rule = create(:comprehension_rule, :universal => false)
          prompt = create(:comprehension_prompt)
          expect(1).to(eq(prompt.rules.length))
          expect(prompt.rules.include?(universal_rule)).to(eq(true))
          expect(prompt.rules.include?(non_universal_rule)).to(eq(false))
        end
        it("not remove existing non-universal assignments") do
          universal_rule = create(:comprehension_rule, :universal => true)
          non_universal_rule = create(:comprehension_rule, :universal => false)
          prompt = create(:comprehension_prompt, :rules => ([non_universal_rule]))
          expect(2).to(eq(prompt.rules.length))
          expect(prompt.rules.include?(universal_rule)).to(eq(true))
          expect(prompt.rules.include?(non_universal_rule)).to(eq(true))
        end
      end
    end
  end
end
