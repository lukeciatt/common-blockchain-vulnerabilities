import { KeyStack  } from "https://deno.land/std@0.170.0/crypto/mod.ts";
import { ensureDir } from "https://deno.land/std@0.171.0/fs/mod.ts";

main()
async function main() {
  
  const data_given_by_gh: Array<string> = Deno.args;
  /*
  * First argument is going to be an array containing the labels
  * Second argument is going to be an object containing the new CBV to be added
  * Third argument is the API v1 GraphQL endpoint to store the CBV
  * Forth argument is going to be the first Key to validate the store endpoint
  * Fifth argument is going to be the second Key to validate the store endpoint
  */

  // LABELS
  const issue_labels = data_given_by_gh[0];
  const is_accepted = issue_labels.match(/Accepted/);
  if (!is_accepted) {
    // Because this exit here, no changes are made, and no code is ever pushed
    console.log(data_given_by_gh)
    Deno.exit(0)
  }
  // BODY
  const issue_body = data_given_by_gh[1];
  const raw_form_data = issue_body;
  
  // KEYS
  const keyStack = new KeyStack([data_given_by_gh[2]]);
  const digest = await keyStack.sign(data_given_by_gh[3]);
  const api_key = digest;
  
  // END POINT
  const api_endpoint = data_given_by_gh[4];
  

  // create a new cbv
  const new_cbv_code_name = await get_new_cbv_code_name ();
  // extract informatio from form string into an object
  const brokedown_form = breakdown_form(raw_form_data, new_cbv_code_name, api_key);
  // create a beautiful .md file to be store in issues
  const cbv_ready_to_be_stored = prettify(brokedown_form)
  // Store the new CBV in Issues folder TODO: check if multiples bc gives back string or array
  await store_new_cbv_in_folder(new_cbv_code_name, cbv_ready_to_be_stored, brokedown_form);

  await store_new_cbv_in_db(brokedown_form, api_endpoint);

  /*
  * Log the CBV code to grab it in github actions
  */
  console.log(new_cbv_code_name)
  return new_cbv_code_name
}


async function get_new_cbv_code_name (): Promise<string> {

  const currentPath = `${Deno.cwd()}/issues`  
  const list_of_all_md = await get_file_names(currentPath)

  let last_cbv_added = 0

  list_of_all_md.flat(2).forEach(file_name => {
    const current_file_number = Number(file_name.replace(/\D/g,''));
    if (current_file_number > last_cbv_added) last_cbv_added = current_file_number;
  });

  // name the next file, allways replace with current year
  const new_cbv_number = (last_cbv_added + 1).toString().slice(2);
  const current_year = (new Date()).getFullYear() - 2000
  const new_cbv_name = `CBV-${current_year}-${new_cbv_number}`
  return new_cbv_name
}

/*
* Recursive function to get all files in issues folder
*/

async function get_file_names(currentPath: string): Promise<string[]> {
  const file_names: string[] = [];

  for await (const dirEntry of Deno.readDir(currentPath)) {
    const entryPath = `${currentPath}/${dirEntry.name}`;
    file_names.push(entryPath);

    if (dirEntry.isDirectory) { //Deno lint can't process this recursion.. code worked fine.
      file_names.push(await get_file_names(entryPath));
    }
  }

  return file_names;
}

/*
* Recieve issues form from github and output an object
*/
function breakdown_form ( issue_form: string, new_cbv_code_name: string, _api_key: string ): CBV{
  const now = getCurrentDate();
  const split = issue_form.split('###')
  const form_object = {
    title: split[1].replace(/Title/, "").trim(),
    short_description: split[2].replace(/Short description/, "").trim(),
    cbv_id: new_cbv_code_name,
    blockchain: split[3].replace(/Blockchain/, "").trim(),
    version_affected: split[4].replace(/Version affected/, "").trim(),
    component: split[5].replace(/Component/, "").trim(),
    severity: split[6].replace(/Severity/, "").trim(),
    vulnerability_type: split[7].replace(/Vulnerability Type/, "").trim(),
    details: split[8].replace(/Details/, "").trim(),
    recommendation: split[9].replace(/Recommendation/, "").trim(),
    references: split[10].replace(/References/, "").trim(),
    labels: split[11].replace(/Labels/, "").trim(),
    tests: split[12].replace(/Test/, "").trim(),
    aditional_comments: split[13].replace(/Aditional comments/, "").trim(),
    created_at: now,
    updated_at: "",
    api_key: _api_key
  }
  return form_object
}

function prettify (form_object: CBV): string {

  const formated_cbv_as_md = `# ${form_object.title}
  
${form_object.short_description}
  
### CBV:ID ${form_object.cbv_id}
### Blockchain: ${form_object.blockchain}
### Version affected: ${form_object.version_affected}
### Component: ${form_object.component}
### Severity: ${form_object.severity}
### Vulnerability Type: ${form_object.vulnerability_type}
### Last updated: ${form_object.created_at}

## Details

${form_object.details}

## Recomendations

${form_object.recommendation}

## References

${form_object.references}

### Labels: ${form_object.labels}

## Test

${form_object.tests}

## Aditional comments

${form_object.aditional_comments}
`

  return formated_cbv_as_md.replace(/_No response_/g, "-")
}

interface CBV {
  title: string;
  short_description: string;
  cbv_id: string;
  blockchain: string;
  version_affected: string;
  component: string;
  severity: string;
  vulnerability_type: string;
  details: string;
  recommendation: string;
  references: string;
  labels: string;
  tests: string;
  aditional_comments: string;
  created_at: string;
  updated_at: string;
  api_key: string;
}

function getCurrentDate() {
  const timeStamp = new Date().toUTCString().split(" ");
  const date = `${timeStamp[1]} ${timeStamp[2]} ${timeStamp[3]}`;
  return date;
}

async function store_new_cbv_in_folder(_new_cbv_code_name: string, _cbv_ready_to_be_stored: string, _cbv_obj: CBV) {
  const get_subfolders: Array<string> = _cbv_obj.blockchain.split(", ")
  // create any blockchain folder that doesn't exist
  for await (const subfolder of get_subfolders) {
    const path = `${Deno.cwd()}/issues/${subfolder}`
    ensureDir(path);
  }
  // store CBV in all it's corresponding directories
  for await (const subfolder of get_subfolders) {
    const path = `${Deno.cwd()}/issues/${subfolder}`
    await Deno.writeTextFile(`${path}/${_new_cbv_code_name}.md`, _cbv_ready_to_be_stored);
  }
  
}

async function store_new_cbv_in_db(_obj_data: CBV, _api_endpoint: string): Promise<void> {
  // TODO:create a function to be sure that this value is stored.
  await fetch(_api_endpoint, {
    method: "POST",
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify( {mutation: `store_cbv: cbv: ${_obj_data}`} )
  })
  //idea, pasar dentro del object data, como un campo mas, la key hasheada, en el back end revisar que coincidan y guardar todo sin el key
}
