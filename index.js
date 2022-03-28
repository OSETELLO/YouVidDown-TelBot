import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import ytdl from "ytdl-core";
import fs from "fs";

const { Telegraf } = require('telegraf'); // importing telegraf.js
var bot = new Telegraf('5179848904:AAFeRnWPJ8fzVF8HTWJA12a_Mvm2h9JbqH8');


bot.start(async (ctx) => {
   ctx.reply('hello !');
});

bot.command('download', async (ctx)=>{
   // Décomposition de la commande
   let command = ctx.update.message.text.split(' ');
   let user_name = ctx.from.first_name;
      // Vérification de la syntaxe
      if(command.length != 2){
         ctx.reply('Veuillez utiliser une syntaxe valide, ' + user_name + ' !');
      }else{
         let youtubeUrl = command[1];
         // Vérification de la validité du lien de la vidéo
         if(!(/^https:\/\/www\.youtube\.com\/watch\?v=/.test(youtubeUrl))){
            ctx.reply('Veuillez entrer le lien d\'une vidéo YouTube valide, ' + user_name + ' !');
         }else{
            ctx.reply(user_name + ', Veuillez patienter pendant que nous téléchargeons votre vidéo...');
            const info = await ytdl.getInfo(youtubeUrl);
            let format = info.formats;
            let title = user_name + '_' + info.videoDetails.title;
            // Téléchargement de la vidéo
            ytdl(youtubeUrl, { filter: format => format.container === 'mp4' })
               .pipe(fs.createWriteStream(`${process.cwd()}/downloads/${title}.mp4`))
               .on('error', (err) => ctx.reply('Désolé ' + user_name + ', Nous n\'avons pas pu télécharger votre vidéo, il se peut qu\'elle ne soit pas disponible au format MP4 !'))
               .on("finish", () => {
                  ctx.reply(user_name + ', Votre vidéo a été téléchargé avec succès ! Nous vous l\'envoyons dans quelques instants...');
                  let stats = fs.statSync(`${process.cwd()}/downloads/${title}.mp4`);
                  //Convert the file size to megabytes (optional)
                  let fileSizeInMegabytes = stats["size"] / 1000000.0;
                  if(fileSizeInMegabytes > 49){
                     ctx.reply(user_name + ', Nous n\'avons pas pu envoyer votre vidéo, désolé; nous ne pouvons pas envoyer les vidéos de plus de 50Mb pour le moment !');
                  }else{
                     ctx.replyWithVideo({source: `${process.cwd()}/downloads/${title}.mp4`}, {caption: title});
                     try {
                        fs.unlinkSync(`${process.cwd()}/downloads/${title}.mp4`)
                        //file removed
                        } catch(err) {
                        console.log(err)
                     }
                  }
               });
         }
      }
});

bot.launch();