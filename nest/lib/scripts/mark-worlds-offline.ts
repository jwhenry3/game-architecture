import { Connection, ConnectionOptions, createConnection } from 'typeorm'
import { DB_CONFIG }                                       from '../config/db.config'

createConnection(<ConnectionOptions>{
    ...DB_CONFIG,
    database: 'presence',
    logging : false
}).then(async (connection: Connection) => {
    await connection.query('UPDATE world set status = \'offline\'')
    await connection.close()
    process.exit(0)
})
