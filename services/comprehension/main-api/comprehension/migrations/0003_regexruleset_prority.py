# Generated by Django 2.2.5 on 2020-01-13 19:42

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('comprehension', '0002_regexruleset_rule'),
    ]

    operations = [
        migrations.AddField(
            model_name='regexruleset',
            name='prority',
            field=models.IntegerField(default=1),
        ),
    ]
