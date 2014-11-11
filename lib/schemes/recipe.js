module.exports = {
    id:                 {type:Number},
    title:              {type:String},
    picture:            String,
    summary:            {type:String},
    description:        {type:String},
    chiefTip:           String,
    timePreparation:    {type:String},
    timeBaking:         {type:String},
    timeRest:           {type:String},
    nbPeople:           {type:Number, default:6},
    level:              String,
    category:           ['Category'],
    dateCreate:         {type:Date, default:Date.now},
    ingredients:        [{
        label:      String,
        shopGroup:  String,
        qte:        String,
        unit:       String,
        step:       String,
        order:      Number
    }]
};