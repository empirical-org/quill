class RuleFeedbackHistory
    def self.generate_report(conjunction:, activity_id:)
        sql_result = self.exec_query(conjunction: conjunction, activity_id: activity_id)
        format_sql_results(sql_result)
    end

    def self.exec_query(conjunction:, activity_id:)
        sql = <<~SQL
            select rules.uid as rules_uid, MAX(prompts.activity_id) as activity_id, MAX(rules.rule_type) as rule_type, MAX(rules.suborder) as rule_suborder, MAX(rules.name) as rule_name, MAX(rules.description) as rule_description, count(feedbacks.id) as feedback_histories_count
            FROM comprehension_rules as rules 
            INNER JOIN comprehension_prompts_rules as prompts_rules ON rules.id = prompts_rules.rule_id 
            INNER JOIN comprehension_prompts as prompts ON prompts_rules.prompt_id = prompts.id 
            LEFT JOIN feedback_histories as feedbacks ON feedbacks.rule_uid = rules.uid
            WHERE prompts.conjunction = '#{conjunction}' AND activity_id = '#{activity_id}'
            GROUP BY rules_uid 
        SQL
        rules = Comprehension::Rule.find_by_sql(sql)
    end

    def self.format_sql_results(relations)
        relations.map do |r|
            {
                rule_uid: r.rules_uid,
                api_name: r.rule_type,
                rule_order: r.rule_suborder,
                feedback_first_layer: 'To Be Implemented', # TODO: to be implemented
                rule_description: r.rule_description,
                rule_name: r.rule_name,
                pct_strong: 0, # TODO: to be implemented
                scored_responses: 0,
                pct_scored: 0
            }

        end


    end

end
