var mongoose = require('mongoose');

module.exports = {
    connectionDB:   null,
    /**
     * Initialise la connexion à MongoDB.
     * @param options Objet de configuration
     */
    initialize:function(options){
        var self = this;

        if(options.settings){
            self.connect(options.settings);
        }

        process.on('exit', function(){
            mongoose.disconnect();
        });

        if(options.server){
            options.server.use(function(req, res, next){
                req.db = self.connectionDB;
                next();
            });
        }
    },
    /**
     * Connexion à la base de données.
     * @param conf
     * @returns {*}
     */
    connect:function(conf){
        if(this.connectionDB === null) {
            this.connectionDB = mongoose.connect('mongodb://' + conf.HOST + '/' + conf.DB_NAME, function (err) {
                if (err) {
                    throw err;
                }
            });
        }

        return this.connectionDB;
    }
};