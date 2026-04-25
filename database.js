class MusicDatabase {
    constructor() {
        this.db = null;
    }

    async init() {
        const config = {
            locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.6.2/${file}`
        };
        const SQL = await initSqlJs(config);
        this.db = new SQL.Database();
        this.db.run(schemaSql);
    }

    query(sql, params = []) {
        const stmt = this.db.prepare(sql);
        stmt.bind(params);
        const results = [];
        while (stmt.step()) {
            results.push(stmt.getAsObject());
        }
        stmt.free();
        return results;
    }

    getAllSongs() {
        return this.query("SELECT * FROM songs");
    }

    getFavorites() {
        return this.query("SELECT * FROM songs WHERE isFavorite = 1");
    }

    searchSongs(term) {
        const query = `%${term}%`;
        return this.query("SELECT * FROM songs WHERE title LIKE ? OR artist LIKE ? OR album LIKE ?", [query, query, query]);
    }

    toggleFavorite(id, status) {
        this.db.run("UPDATE songs SET isFavorite = ? WHERE id = ?", [status ? 1 : 0, id]);
    }
}

window.musicDB = new MusicDatabase();
