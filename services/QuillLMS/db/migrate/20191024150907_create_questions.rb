class CreateQuestions < ActiveRecord::Migration
  def change
    create_table :questions do |t|
      t.string :uid
      t.jsonb :data

      t.timestamps null: false

      t.index :uid, unique: true
    end
  end
end
