import { CustomerRepository } from '../repositories/customer.repository';
import { CreateCustomerDto } from '../dtos/create-customer.dto';

export class CustomerService {
  constructor(private readonly repo = new CustomerRepository()) {}

  createCustomer(dto: CreateCustomerDto) {
    return this.repo.create(dto);
  }

  getCustomer(id: number) {
    return this.repo.findById(id);
  }

  searchCustomers(search = '', cursor?: number, limit?: number) {
    return this.repo.search(search, cursor, limit);
  }

  async updateCustomer(id: number, dto: Partial<CreateCustomerDto>) {
    return this.repo.update(id, dto);
  }

  async deleteCustomer(id: number) {
    return this.repo.softDelete(id);
  }
}
