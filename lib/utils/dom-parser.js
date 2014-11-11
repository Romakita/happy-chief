var Promise = require('promise');
var htmlparser = require("htmlparser2");
var document = htmlparser.DomUtils;

module.exports = {

    parse:function(content){
        var self = this;

        return new Promise(function(resolve, reject){

            var handler = new htmlparser.DomHandler(function (error, dom) {
                if (error){
                    reject(error)
                }
                else{
                    var title = self.getTitle(dom).trim();

                    if(title == 'Recette de'){
                        reject(false);
                    }else {
                        resolve({
                            title: title,
                            dom2:   self.getFirstPart(dom),
                            dom:    self.getSecondPart(dom)
                        });
                    }
                }
            });

            var parser = new htmlparser.Parser(handler);
            parser.write(content.replace(/\r|\n/gi, ''));
            parser.done();

        })

            .then(function(obj){

                var dom =   obj.dom;
                var dom2 =  obj.dom2;

                var  recipe = {};

                recipe.title = obj.title.replace('Recette de ','');

                recipe.description = self.getDescription(dom);
                recipe.summary = self.getSummary(dom);
                recipe.timePreparation = self.getTimePreparation(dom);
                recipe.timeBaking = self.getTimeBaking(dom);
                recipe.timeRest = self.getTimeRest(dom);
                recipe.picture = self.getPicture(dom).replace('-c' + obj.id, '-e' + obj.id);
                recipe.ingredients = self.getIngredients(dom, dom2);
                recipe.chiefTip = self.getChiefTip(dom);

                return recipe;
            });
    },
    /**
     *
     * @param dom
     * @returns {*}
     */
    getTitle: function (dom) {
        var nodes = document.getElementsByTagName('h1', dom);
        var h1 = document.getElements({class: "marginT0"}, nodes);

        document.removeElement(h1);

        return h1[0].children[0].data;
    },
    /**
     *
     * @param dom
     * @returns {*}
     */
    getFirstPart: function (dom) {
        var nodes = document.getElements({class: "bd_b80d21_R_2px_dot va_top"}, dom);
        return nodes[0];
    },
    /**
     *
     * @param dom
     * @returns {*}
     */
    getSecondPart: function (dom) {
        var nodes = document.getElements({class: "f_left marginL20"}, dom);
        return nodes[0];
    },

    getChiefTip:function(dom){

        var nodes = document.getElements({class: "f_left fs_12 width124 marginT0"}, dom);
        return document.getInnerHTML(nodes[0]).trim();
    },

    getSummary:function(dom){
        var nodes = document.getElements({class: "marginB10 infoRecette fs_14"}, dom);
        return document.getInnerHTML(nodes[0]).trim();
    },

    getDescription:function(dom){
        var nodes = document.getElements({class: "descriptif_r fs_14"}, dom);
        nodes = document.getElements({class: "marginT0"}, nodes);

        return document.getInnerHTML(nodes[0]).trim();
    },

    getTimePreparation:function(dom){
        var nodes = document.getElements({class: "background_b80d21 fs_13 f_left marginR10 paddingL5 paddingR5 paddingT2 paddingB2 bd_b80d21_TRBL"}, dom);
        nodes = document.getElements({class:'mrron_ul'}, nodes[0]);

        return document.getInnerHTML(nodes[0]).trim();
    },

    getTimeBaking:function(dom){
        var nodes = document.getElements({class: "background_b80d21 fs_13 f_left marginR10 paddingL5 paddingR5 paddingT2 paddingB2 bd_b80d21_TRBL"}, dom);
        //nodes = document.getElements({class:'mrron_ul'}, nodes[1]);

        return document.getInnerHTML(nodes[1]).replace('CUISSON&nbsp;:&nbsp; ', '').trim();
    },

    getTimeRest:function(dom){
        var document = htmlparser.DomUtils;
        var nodes = document.getElements({class: "background_b80d21 fs_13 f_left paddingL5 paddingR5 paddingT2 paddingB2 bd_b80d21_TRBL"}, dom);

        return document.getInnerHTML(nodes[0]).replace('REPOS :  ', '').replace('REPOS&nbsp;:&nbsp; ', '').trim();
    },


    getPicture:function(dom){
        var nodes = document.getElements({class: "f_left marginT10 marginL15 width180"}, dom);
        nodes = document.getElementsByTagName('img', dom);

        return nodes[2].attribs.src;
    },

    getIngredients:function(dom, dom2){
        var nodes = document.getElements({class: "paddingL0 fs_12 "}, dom);
        nodes =  nodes[0].children;

        var ingredients =   [];
        var hash =          {};
        var step =          '';

        for(var i = 0; i < nodes.length; i++) {
            var current = nodes[i];
            var text = document.getInnerHTML(current);

            if (current.name == 'li') {
                text = text.split(' : ');
                var qte = text[1].split(' ');
                var obj = {
                    label:      text[0].trim(),
                    shopGroup:  '',
                    qte:        qte[0].trim(),
                    unit:       qte[1].trim(),
                    step:       step,
                    order:      ingredients.length
                };

                hash[obj.label] = ingredients.length;

                ingredients.push(obj);
            }else{
                step = text.trim();
            }
        }

        //récupération du shopGroup
        var shopGroup =     '';
        var nodes =         document.getElements({class: "paddingL0 marginL10 marginT0 "}, dom2);
        var nodes =         nodes[0].children;


        for(var i = 0; i < nodes.length; i++) {

            var current =   nodes[i];
            var text =      document.getInnerHTML(current);

            if(current.attribs.class == 'bold fs_13 c_785d47 marginB5'){
                shopGroup = text.replace('<br />', '');
            }else{
                text = text.split('&nbsp;:&nbsp;');
                text = text[0].trim();

                if(typeof hash[text] != 'undefined'){

                    if(ingredients[hash[text]]){
                        ingredients[hash[text]].shopGroup = shopGroup;
                    }else{
                        console.log(text, ' ', hash[text]);
                        console.log(ingredients.length);
                    }
                }
            }

        }

        return ingredients;
    }
};