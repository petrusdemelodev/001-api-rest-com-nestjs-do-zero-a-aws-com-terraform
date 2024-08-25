import { v4 as uuid } from 'uuid';

interface UserProps {
  name: string;
  email: string;
  password: string;
}

type UserUpdate = Partial<User> & UserProps;

export class User {
  public readonly id: string;
  public readonly name: string;
  public readonly email: string;
  public readonly createdAt: Date;
  public password: string;
  public updatedAt: Date;

  constructor(init: UserUpdate) {
    Object.assign(
      this,
      {
        id: uuid(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      init,
    );
  }
}
