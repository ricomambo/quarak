# == Schema Information
#
# Table name: users
#
#  id              :integer          not null, primary key
#  email           :string(255)      default(""), not null
#  name            :string(255)
#  token           :string(255)
#  created_at      :datetime
#  updated_at      :datetime
#  active          :boolean          default(TRUE)
#  password_digest :string(255)
#

class User < ActiveRecord::Base
  has_and_belongs_to_many :expenses, inverse_of: :members
  has_and_belongs_to_many :projects, inverse_of: :members
  has_many :payed_expenses,    class_name: "Expense",    foreign_key: "payer_id", inverse_of: :payer
  has_many :payed_settlements, class_name: 'Settlement', foreign_key: 'payer_id', inverse_of: :payer
  has_many :received_settlements, class_name: 'Settlement', foreign_key: 'payee_id', inverse_of: :payee

  validates_presence_of :email
  validates_uniqueness_of :email

  before_save :ensure_token

  has_secure_password

  def self.authenticate(email, clear_password)
    find_by_email(email).try(:authenticate, clear_password)
  end

  def ensure_token
    if token.blank?
      self.token = generate_token
    end
  end

  def reset_token!
    self.token = generate_token
    self.save
  end

  private

  def generate_token
    loop do
      token = SecureRandom.urlsafe_base64(nil, false)
      break token unless User.find_by_token(token)
    end
  end
end
