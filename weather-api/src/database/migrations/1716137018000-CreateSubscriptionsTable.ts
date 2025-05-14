import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateSubscriptionsTable1716137018000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // First create the enum type
    await queryRunner.query(`
      CREATE TYPE "subscription_frequency_enum" AS ENUM('hourly', 'daily');
    `);

    // Then create the table
    await queryRunner.createTable(
      new Table({
        name: 'subscriptions',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'email',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'city',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'frequency',
            type: 'subscription_frequency_enum',
            isNullable: false,
            default: "'daily'",
          },
          {
            name: 'confirmed',
            type: 'boolean',
            default: false,
          },
          {
            name: 'confirmationToken',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'unsubscribeToken',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
        indices: [
          {
            name: 'IDX_SUBSCRIPTION_EMAIL_CITY',
            columnNames: ['email', 'city'],
            isUnique: true,
          },
          {
            name: 'IDX_SUBSCRIPTION_CONFIRMATION_TOKEN',
            columnNames: ['confirmationToken'],
            isUnique: true,
          },
          {
            name: 'IDX_SUBSCRIPTION_UNSUBSCRIBE_TOKEN',
            columnNames: ['unsubscribeToken'],
            isUnique: true,
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('subscriptions');
    await queryRunner.query(`DROP TYPE "subscription_frequency_enum"`);
  }
}
