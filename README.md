# Whiskey Production System Backend

A comprehensive backend API for managing whiskey production operations, including fermentation, distillation, barrel management, bottling, transfers, and TTB reporting.

## Features

### 🏭 Production Management

- **Fermentation Runs**: Track fermentation batches with temperature, volume, and proof monitoring
- **Distillation Tracking**: Monitor distillation processes and batch completion
- **Production Batches**: Complete CRUD operations for production batches

### 🛢️ Barrel Management

- **Barrel Inventory**: Track barrel numbers, types, char/toast levels, and capacity
- **Rackhouse Management**: Monitor barrel locations and aging status
- **Barrel Logs**: Detailed logging of barrel operations (fill, dump, transfer, sampling, inspection)
- **Dump Logs**: Track when barrels are dumped and their final characteristics

### 🔄 Processing Operations

- **Batching Runs**: Manage blending, filtering, chill filtering, carbon filtering, and finishing operations
- **Bottling Runs**: Track bottling operations with bottle sizes, quantities, and production volumes
- **Batch Tracking**: Link bottling runs to batching runs for complete traceability

### 🚛 Transfer In Bond (TIB)

- **Inbound/Outbound Transfers**: Track barrel, container, tote, and tanker transfers
- **TTB Compliance**: Monitor seal numbers, carriers, and transfer status
- **Transfer History**: Complete audit trail of all transfer operations

### 📦 Finished Goods Management

- **Inventory Tracking**: Monitor finished goods inventory by location and status
- **Bailment/Depletion Tracking**: Track sales, samples, damage, theft, returns, and adjustments
- **Warehouse Management**: Track goods from receipt to shipment

### 🏗️ Tank Management

- **Tank Inventory**: Monitor storage, blending, finishing, filtering, and temporary tanks
- **Tank Logs**: Track fills, empties, transfers, filtering, adjustments, and maintenance
- **Capacity Management**: Monitor tank utilization and status

### 📊 Reports & Logs

- **TTB Reports**: Generate monthly production and inventory reports
- **Compliance Tracking**: Monitor report submission and approval status
- **Audit Trails**: Complete logging of all operations for regulatory compliance

## API Endpoints

### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Production

- `GET /api/production` - Get all production batches
- `POST /api/production` - Create production batch
- `GET /api/production/:id` - Get production batch by ID
- `PUT /api/production/:id` - Update production batch
- `DELETE /api/production/:id` - Delete production batch

### Barrels

- `GET /api/barrels` - Get all barrels
- `POST /api/barrels` - Create barrel
- `GET /api/barrels/:id` - Get barrel by ID
- `PUT /api/barrels/:id` - Update barrel
- `DELETE /api/barrels/:id` - Delete barrel
- `GET /api/barrels/:barrelId/logs` - Get barrel logs
- `POST /api/barrels/:barrelId/logs` - Create barrel log
- `GET /api/barrels/inventory/summary` - Get barrel inventory summary

### Batching & Bottling

- `GET /api/batching/batching` - Get all batching runs
- `POST /api/batching/batching` - Create batching run
- `GET /api/batching/batching/:id` - Get batching run by ID
- `PUT /api/batching/batching/:id` - Update batching run
- `DELETE /api/batching/batching/:id` - Delete batching run
- `GET /api/batching/bottling` - Get all bottling runs
- `POST /api/batching/bottling` - Create bottling run
- `GET /api/batching/bottling/:id` - Get bottling run by ID
- `PUT /api/batching/bottling/:id` - Update bottling run
- `DELETE /api/batching/bottling/:id` - Delete bottling run

### Transfers

- `GET /api/transfers` - Get all transfers
- `POST /api/transfers` - Create transfer
- `GET /api/transfers/:id` - Get transfer by ID
- `PUT /api/transfers/:id` - Update transfer
- `DELETE /api/transfers/:id` - Delete transfer
- `GET /api/transfers/stats/summary` - Get transfer statistics

### Finished Goods

- `GET /api/finished-goods/finished-goods` - Get all finished goods
- `POST /api/finished-goods/finished-goods` - Create finished goods
- `GET /api/finished-goods/finished-goods/:id` - Get finished goods by ID
- `PUT /api/finished-goods/finished-goods/:id` - Update finished goods
- `DELETE /api/finished-goods/finished-goods/:id` - Delete finished goods
- `GET /api/finished-goods/bailment-depletions` - Get all bailment depletions
- `POST /api/finished-goods/bailment-depletions` - Create bailment depletion
- `GET /api/finished-goods/bailment-depletions/:id` - Get bailment depletion by ID
- `PUT /api/finished-goods/bailment-depletions/:id` - Update bailment depletion
- `DELETE /api/finished-goods/bailment-depletions/:id` - Delete bailment depletion
- `GET /api/finished-goods/finished-goods/inventory/summary` - Get finished goods inventory summary

### Tanks

- `GET /api/tanks` - Get all tanks
- `POST /api/tanks` - Create tank
- `GET /api/tanks/:id` - Get tank by ID
- `PUT /api/tanks/:id` - Update tank
- `DELETE /api/tanks/:id` - Delete tank
- `GET /api/tanks/:tankId/logs` - Get tank logs
- `POST /api/tanks/:tankId/logs` - Create tank log
- `GET /api/tanks/inventory/summary` - Get tank inventory summary

### TTB Reports

- `GET /api/ttb-reports` - Get all TTB reports
- `POST /api/ttb-reports` - Create TTB report
- `GET /api/ttb-reports/:id` - Get TTB report by ID
- `PUT /api/ttb-reports/:id` - Update TTB report
- `DELETE /api/ttb-reports/:id` - Delete TTB report
- `GET /api/ttb-reports/generate/monthly-production/:year/:month` - Generate monthly production report
- `GET /api/ttb-reports/generate/monthly-inventory/:year/:month` - Generate monthly inventory report
- `GET /api/ttb-reports/stats/summary` - Get TTB report statistics

### Containers & Transactions

- `GET /api/containers` - Get all containers
- `POST /api/containers` - Create container
- `GET /api/containers/:id` - Get container by ID
- `PUT /api/containers/:id` - Update container
- `DELETE /api/containers/:id` - Delete container
- `POST /api/containers/bulk` - Bulk create containers
- `GET /api/transactions` - Get all transactions
- `POST /api/transactions` - Create transaction
- `GET /api/transactions/:id` - Get transaction by ID
- `GET /api/transactions/stats/summary` - Get transaction statistics

## Database Schema

### Core Models

- **User**: User authentication and management
- **Product**: Product definitions and specifications
- **Container**: Generic container management (barrels, tanks, totes, etc.)
- **Transaction**: Audit trail for all operations

### Production Models

- **ProductionBatch**: Fermentation and distillation batches
- **BatchingRun**: Processing operations (blending, filtering, etc.)
- **BottlingRun**: Bottling operations and production

### Barrel Management Models

- **Barrel**: Barrel inventory with char/toast levels and aging
- **BarrelLog**: Detailed logging of barrel operations

### Transfer Models

- **Transfer**: Transfer In Bond operations for barrels and containers

### Finished Goods Models

- **FinishedGoods**: Finished product inventory
- **BailmentDepletion**: Depletion tracking for regulatory compliance

### Tank Management Models

- **Tank**: Tank inventory and status
- **TankLog**: Tank operation logging

### Reporting Models

- **TTBReport**: TTB compliance reporting

## Installation & Setup

1. **Install Dependencies**

   ```bash
   npm install
   ```

2. **Environment Setup**

   ```bash
   cp env.example .env
   # Configure your database URL and other environment variables
   ```

3. **Database Setup**

   ```bash
   # Generate Prisma client
   npx prisma generate

   # Run migrations
   npx prisma migrate dev

   # (Optional) Seed database
   npm run db:seed
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

## Environment Variables

```env
DATABASE_URL="postgresql://username:password@localhost:5432/whiskey_db"
JWT_SECRET="your-jwt-secret"
NODE_ENV="development"
```

## Technology Stack

- **Node.js** with **TypeScript**
- **Express.js** for API framework
- **Prisma** for database ORM
- **PostgreSQL** for database
- **JWT** for authentication
- **Express Validator** for input validation

## Compliance Features

### TTB Reporting

- Monthly production reports
- Monthly inventory reports
- Annual production summaries
- Special report generation

### Audit Trails

- Complete transaction logging
- Barrel operation history
- Transfer documentation
- Tank movement tracking

### Regulatory Compliance

- Proof tracking and adjustments
- Volume monitoring and corrections
- Transfer In Bond documentation
- Bailment depletion tracking

## Development

### Running Tests

```bash
npm test
```

### Linting

```bash
npm run lint
```

### Database Management

```bash
# View database in Prisma Studio
npm run db:studio

# Reset database
npm run db:reset

# Deploy migrations to production
npm run db:deploy
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details
