module Api
  module V1
    class ExpensesController < ApiController
      wrap_parameters include: [:date, :category, :provider, :amount, :payer_id, :comments, :member_ids]
      before_action :set_project
      before_action :set_expense, only: [:show, :update, :destroy]

      def index
        @expenses = @project.expenses.order(date: :desc)
        @expenses = @expenses.limit(params[:limit]) if params[:limit]
      end

      def show
      end

      def create
        @expense = @project.expenses.new(expense_params)

        if @expense.save
          render :show, status: :created, location: api_project_expense_url(@project, @expense)
        else
          render json: @expense.errors, status: :unprocessable_entity
        end
      end

      def update
        if @expense.update(expense_params)
          render :show, status: :ok, location: api_project_expense_url(@project, @expense)
        else
          render json: @expense.errors, status: :unprocessable_entity
        end
      end

      def destroy
        @expense.destroy
        head :no_content
      end

      def by_month
        @months = @project.expenses.by_month
      end

      def by_category
        @categories = @project.expenses.by_category
      end

      private
        # Use callbacks to share common setup or constraints between actions.
        def set_expense
          @expense = @project.expenses.find(params[:id])
        end

        def set_project
          @project = Project.find(params[:project_id])
          authorize @project, :show?
        end

        # Never trust parameters from the scary internet, only allow the white list through.
        def expense_params
          params.require(:expense).permit(:date, :category, :provider, :amount, :payer_id, :comments, :member_ids => [])
        end
    end
  end
end
