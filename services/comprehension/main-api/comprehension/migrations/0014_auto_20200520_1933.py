# Generated by Django 2.2.5 on 2020-05-20 19:33

from django.db import migrations, models

def transfer_prompt_rule_sets_many_to_many(apps, schema_editor):
    Prompt = apps.get_model('comprehension', 'Prompt')
    RuleSet = apps.get_model('comprehension', 'RuleSet')

    rule_sets = RuleSet.objects.all()
    for rule_set in rule_sets:
        prompt = rule_set.prompt
        if prompt:
            print(f'adding RuleSet {rule_set.id} to Prompt {prompt.id}')
            prompt.rule_sets.add(rule_set)
            prompt.save()

def transfer_prompt_rule_sets_one_to_one(apps, schema_editor):
    Prompt = apps.get_model('comprehension', 'Prompt')
    RuleSet = apps.get_model('comprehension', 'RuleSet')

    prompts = Prompt.objects.all()
    for prompt in prompts:
        rule_sets = prompt.rule_sets.all()
        for rule_set in rule_sets:
            rule_set.prompt = prompt


class Migration(migrations.Migration):

    dependencies = [
        ('comprehension', '0012_auto_20200515_1545'),
    ]

    operations = [
        migrations.AddField(
            model_name='prompt',
            name='rule_sets',
            field=models.ManyToManyField(to='comprehension.RuleSet'),
        ),

        migrations.RunPython(transfer_prompt_rule_sets_many_to_many, reverse_code=transfer_prompt_rule_sets_one_to_one),

        migrations.AlterUniqueTogether(
            name='ruleset',
            unique_together=set(),
        ),
        migrations.RemoveField(
            model_name='ruleset',
            name='prompt',
        ),
    ]



