class CreateRaids < ActiveRecord::Migration
  def change
    create_table :raids do |t|
      t.string :attacker
      t.string :defender
      t.float :soldiers
      t.float :money
      t.timestamps
    end
  end
end
