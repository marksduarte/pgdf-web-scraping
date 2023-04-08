require('dotenv/config');

const puppeteer = require('puppeteer');
const csv = require('csv-parser');
const fs = require('fs');

const {
  PGDF_URL,
  INPUT_TEXT_SEARCH,
  INPUT_TEXT_NOME_CREDOR,
  INPUT_TEXT_CPF,
  INPUT_TEXT_PRECAT_PJE,
  INPUT_TEXT_PRECAT_FISICO,
  INPUT_TEXT_PROC_ORIGEM,
  INPUT_TEXT_PRECAT_POSICAO,
  INPUT_TEXT_PRECAT_ANO,
  INPUT_TEXT_PRECAT_NATUREZA,
  INPUT_TEXT_PRECAT_TRIBUNAL,
  TAG_OPTIONS,
  BUTTON_SEARCH,
  PATH_PESSOAS_LOCALIZADAS_JSON,
  PATH_PESSOAS_CSV,
  TEXT_MESSAGE_SESSAO
} = process.env

const ScraperPGDF = async (pessoas) => {
  let cc = 0;
  // open browser
  const browser = await puppeteer.launch({ headless: false, timeout: 30000, defaultViewport: { width: 1280, height: 800 } });
  // create new page
  const page = await browser.newPage();
  // load url
  page.once('load', () => console.info('✔️ Page is loaded'));
  await page.goto(PGDF_URL);

  console.log('🔍 Searching peoples...')

  for (let pessoa of pessoas) {
    if (cc < 0) {
      cc++;
      continue;
    }
    // --->
    console.log('😉', ++cc, pessoa.nome);
    // search by cpf or name
    let findBy = (pessoa.cpf != null) ? formataCPF(pessoa.cpf) : pessoa.nome;
    await clearInputTextAndTypeString(page, INPUT_TEXT_SEARCH, findBy);
    await page.waitFor(2000);

    if ((await page.$(TAG_OPTIONS)) === null) {
      console.log('❌ Not found.')
      continue;
    }
    const anchorsCount = await page.$$eval('a.os-internal-ui-corner-all.needsclick', a => a.length);

    pessoa.precatorios = [];
    for (let i = 0; i < anchorsCount; i++) {
      let a = (await page.$$('a.os-internal-ui-corner-all.needsclick'))[i];

      await a.click();
      await page.click(BUTTON_SEARCH);
      await page.waitFor(2000);

      let precat = {
        nome: await page.$eval(INPUT_TEXT_NOME_CREDOR, el => el.value),
        cpf: await page.$eval(INPUT_TEXT_CPF, el => el.value),
        numPrecatPje: await page.$eval(INPUT_TEXT_PRECAT_PJE, el => el.value),
        numPrecatFisico: await page.$eval(INPUT_TEXT_PRECAT_FISICO, el => el.value),
        numProcOrigem: await page.$eval(INPUT_TEXT_PROC_ORIGEM, el => el.value),
        posicao: await page.$eval(INPUT_TEXT_PRECAT_POSICAO, el => el.value),
        ano: await page.$eval(INPUT_TEXT_PRECAT_ANO, el => el.value),
        natureza: await page.$eval(INPUT_TEXT_PRECAT_NATUREZA, el => el.value),
        tribunal: await page.$eval(INPUT_TEXT_PRECAT_TRIBUNAL, el => el.value),
        alerta: await page.$eval(TEXT_MESSAGE_SESSAO, el => el.value)
      }
      pessoa.precatorios.push(precat);
      console.log('💸', precat.numPrecatFisico);
      await clearInputTextAndTypeString(page, INPUT_TEXT_SEARCH, findBy);
    }
    saveToFile(pessoa);
  }
};

const clearInputTextAndTypeString = async (page, tag, text) => {
  const input = await page.$(tag);
  await input.click({ clickCount: 3 });
  await page.keyboard.press('Backspace');
  await input.type(text);
  await page.waitFor(2000);
}

function parseCsvtoJson() {
  let list = []
  fs.createReadStream(PATH_PESSOAS_CSV)
    .pipe(csv({
      separator: ';',
      headers: ['nome', 'situacao', 'cpf', 'idade']
    }))
    .on('data', (row) => {
      list.push(row);
    })
    .on('end', () => {
      console.log('✔️ CSV file successsfully processed')
    });
  return list;
}

function saveToFile(pessoa) {
  let jsonContent = JSON.stringify(pessoa, null, '\t');
  fs.appendFileSync(PATH_PESSOAS_LOCALIZADAS_JSON, jsonContent.concat(','), 'utf-8', function (err) {
    if (err) {
      console.error('❌ An error occured while writing json object to file.');
      return console.error(err);
    }
    console.log('✔️ Json file has been updated.');
  })
}

function formataCPF(cpf) {
  //retira os caracteres indesejados...
  cpf = cpf.replace(/[^\d]/g, "");

  if (cpf !== null || cpf.length < 11) {
    for (let i = 0; i < (11 - cpf.length); i++) {
      cpf = '0'.concat(cpf);
    }
  }

  //realizar a formatação...
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

// start program
const pessoas = parseCsvtoJson();
ScraperPGDF(pessoas).catch(error => console.error(error));
