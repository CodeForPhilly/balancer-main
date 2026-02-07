# Database Connection Configuration

The balancer application supports connecting to PostgreSQL databases via two methods:

1. **CloudNativePG** - Kubernetes-managed PostgreSQL cluster (within cluster)
2. **AWS RDS** - External PostgreSQL database (AWS managed)

The application automatically detects the connection type based on the `SQL_HOST` environment variable format.

## Connection Type Detection

The application determines the connection type by analyzing the `SQL_HOST` value:

- **CloudNativePG**: 
  - Contains `.svc.cluster.local` (Kubernetes service DNS)
  - Short service name (e.g., `balancer-postgres-rw`)
  - Typically no SSL required within cluster

- **AWS RDS**:
  - Full domain name (e.g., `balancer-db.xxxxx.us-east-1.rds.amazonaws.com`)
  - External IP address
  - Typically requires SSL

## Configuration

### Environment Variables

All database configuration is done via environment variables:

- `SQL_ENGINE`: Database engine (default: `django.db.backends.postgresql`)
- `SQL_DATABASE`: Database name
- `SQL_USER`: Database username
- `SQL_PASSWORD`: Database password
- `SQL_HOST`: Database host (see examples below)
- `SQL_PORT`: Database port (default: `5432`)
- `SQL_SSL_MODE`: Optional SSL mode (see SSL Configuration below)

### CloudNativePG Configuration

When using CloudNativePG, the application connects to the Kubernetes service created by the operator.

**Example Configuration:**
```bash
SQL_ENGINE=django.db.backends.postgresql
SQL_DATABASE=balancer
SQL_USER=balancer
SQL_PASSWORD=<password-from-secret>
SQL_HOST=balancer-postgres-rw
SQL_PORT=5432
```

**Service Names:**
- `{cluster-name}-rw`: Read-write service (primary instance)
- `{cluster-name}-r`: Read service (replicas)
- `{cluster-name}-ro`: Read-only service

**Full DNS Name:**
```bash
SQL_HOST=balancer-postgres-rw.balancer.svc.cluster.local
```

### AWS RDS Configuration

When using AWS RDS, the application connects to the external RDS endpoint.

**Example Configuration:**
```bash
SQL_ENGINE=django.db.backends.postgresql
SQL_DATABASE=balancer
SQL_USER=balancer
SQL_PASSWORD=<rds-password>
SQL_HOST=balancer-db.xxxxx.us-east-1.rds.amazonaws.com
SQL_PORT=5432
SQL_SSL_MODE=require
```

### Local Docker Compose Configuration

When using Docker Compose for local development, the application connects to the `db` service container.

**Example Configuration:**
```bash
SQL_ENGINE=django.db.backends.postgresql
SQL_DATABASE=balancer_dev
SQL_USER=balancer
SQL_PASSWORD=balancer
SQL_HOST=db
SQL_PORT=5432
```

## SSL Configuration

### CloudNativePG

SSL is typically **not required** for connections within the Kubernetes cluster. The application will not use SSL by default for CloudNativePG connections.

### AWS RDS

SSL is typically **required** for AWS RDS connections. The application defaults to `require` mode for external hosts, but you can override this:

**SSL Mode Options:**
- `disable`: No SSL
- `allow`: Try non-SSL first, then SSL
- `prefer`: Try SSL first, then non-SSL (default for external)
- `require`: Require SSL
- `verify-ca`: Require SSL and verify CA
- `verify-full`: Require SSL and verify CA and hostname

**Example:**
```bash
SQL_SSL_MODE=require
```

## Migration Guide

### From AWS RDS to CloudNativePG

1. Update the `SQL_HOST` environment variable in your SealedSecret:
   ```bash
   # Old (AWS RDS)
   SQL_HOST=balancer-db.xxxxx.us-east-1.rds.amazonaws.com
   
   # New (CloudNativePG)
   SQL_HOST=balancer-postgres-rw
   ```

2. Update database credentials to match CloudNativePG secret

3. Remove or set `SQL_SSL_MODE` to `disable` (optional, as it's auto-detected)

4. Restart the application pods

### From CloudNativePG to AWS RDS

1. Update the `SQL_HOST` environment variable:
   ```bash
   # Old (CloudNativePG)
   SQL_HOST=balancer-postgres-rw
   
   # New (AWS RDS)
   SQL_HOST=balancer-db.xxxxx.us-east-1.rds.amazonaws.com
   ```

2. Update database credentials to match RDS credentials

3. Set `SQL_SSL_MODE=require` (or appropriate mode)

4. Ensure network connectivity (VPC peering, security groups, etc.)

5. Restart the application pods

## Troubleshooting

### Connection Issues

1. **Verify host format**: Check that `SQL_HOST` matches the expected format for your connection type

2. **Check network connectivity**: 
   - CloudNativePG: Ensure pods are in the same namespace
   - AWS RDS: Verify VPC peering, security groups, and network ACLs

3. **Verify credentials**: Ensure username, password, and database name are correct

4. **Check SSL configuration**: For AWS RDS, ensure SSL is properly configured

### Common Errors

**"Connection refused"**
- Verify the host and port are correct
- Check if the database service is running
- Verify network connectivity

**"SSL required"**
- Add `SQL_SSL_MODE=require` for AWS RDS connections
- Verify SSL certificates are available

**"Authentication failed"**
- Verify username and password
- Check database user permissions
- Ensure the database exists

## References

- [Django Database Configuration](https://docs.djangoproject.com/en/4.2/ref/settings/#databases)
- [CloudNativePG Documentation](https://cloudnative-pg.io/)
- [AWS RDS PostgreSQL](https://docs.aws.amazon.com/rds/latest/userguide/CHAP_PostgreSQL.html)
- [PostgreSQL SSL Configuration](https://www.postgresql.org/docs/current/libpq-ssl.html)

