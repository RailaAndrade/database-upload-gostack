import { getRepository, getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';
import TransactionsRepository from '../repositories/TransactionsRepository';
import Transaction from '../models/Transaction';
import Category from '../models/Category';

interface Request {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionRepository = getCustomRepository(TransactionsRepository);
    // const balanceRepository=new TransactionsRepository();
    const { total } = await transactionRepository.getBalance();

    if (type === 'outcome' && total < value) {
      throw new AppError('Transaction not allowed');
    }

    const categoryRepository = getRepository(Category);

    const categoryExistsWithTitle = await categoryRepository.findOne({
      where: { title: category },
    });

    let categoryCreated = null;

    if (!categoryExistsWithTitle) {
      categoryCreated = await categoryRepository.create({
        title: category,
      });

      await categoryRepository.save(categoryCreated);
    }

    const transaction = await transactionRepository.create({
      title,
      value,
      type,
      category_id:
        (categoryExistsWithTitle && categoryExistsWithTitle.id) ||
        categoryCreated?.id,
    });

    await transactionRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
