import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {

    const transactions = await this.find();
    const {income,outcome}= await transactions.reduce((accumulator:Balance, transaction:Transaction)=>{

      if(transaction.type==='income'){
        accumulator.income+=Number(transaction.value);

      }else if (transaction.type==='outcome'){
        accumulator.outcome+=Number(transaction.value);
      }
      return accumulator;
    },{
      income:0,
      outcome:0,
      total:0
    })
   const total = income-outcome;

   const balance: Balance = { income, outcome, total };

    return balance;
  }
}

export default TransactionsRepository;
