const { Pool } = require("pg");

const pool = new Pool({
    user: "postgres",
    host: "localhost",
    password: "postgres",
    database: "elecciones",
    port: 5432,
});

const guardarCandidato = async(candidato) => {
    const values = Object.values(candidato);
    try {
        const consulta = {
            text: "insert into candidatos (nombre, foto, color, votos) values ($1, $2, $3, 0)",
            values,
        };

        const result = await pool.query(consulta);
        return result;
    } catch (error) {
        console.log(error);
    }
};

const getCandidato = async() => {
    const result = await pool.query("select * from candidatos");
    return result.rows;
};

const editCandidato = async(candidato) => {
    const values = Object.values(candidato);
    try {
        const consulta = {
            text: "update candidatos set nombre = $1, foto = $2 where id = $3 returning *",
            values,
        };

        const result = await pool.query(consulta);
        return result;
    } catch (error) {
        console.log(error);
    }
};

const eliminarCandidato = async(id) => {
    const result = await pool.query(`delete from candidatos where id = ${id}`);
    return result.rows;
};

const registrarVotos = async(voto) => {
    const values = Object.values(voto);

    const registrarVotoHistorial = {
        text: "insert into historial (estado,votos,ganador) values ($1,$2,$3)",
        values,
    };
    const registrarVotoCandidato = {
        text: "update candidatos set votos = votos + $1 where nombre = $2",
        values: [+values[1], values[2]],
    };
    try {
        await pool.query("begin");
        await pool.query(registrarVotoHistorial);
        await pool.query(registrarVotoCandidato);
        await pool.query("commit");
        return true;
    } catch (error) {
        await pool.query("rollback");
        throw error;
    }
};

const getHistorial = async() => {
    const consulta = {
        text: `select * from historial`,
        rowMode: "array",
    };
    const result = await pool.query(consulta);
    return result.rows;
};

module.exports = {
    guardarCandidato,
    getCandidato,
    editCandidato,
    eliminarCandidato,
    registrarVotos,
    getHistorial,
};