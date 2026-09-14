// ----------------------------------------
// T-CHIT — SUPABASE CLIENT
// ----------------------------------------

const SUPABASE_URL =
    "https://cxadrxmegdsjjihjtmbt.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_a2CB5jbvFUT1aZSKUnQ1Vg_gQ5l_FAq";

const TCHIT_KEY_STORAGE =
    "tchit_access_key";


// ----------------------------------------
// ACCESS KEY
// ----------------------------------------

function getTchitAccessKey() {

    return localStorage.getItem(
        TCHIT_KEY_STORAGE
    );

}


function setTchitAccessKey(key) {

    localStorage.setItem(
        TCHIT_KEY_STORAGE,
        key
    );

}


// ----------------------------------------
// SUPABASE CLIENT
// ----------------------------------------

let tchitAccessKey =
    getTchitAccessKey();


function initializeSupabaseClient() {

    supabaseClient =
        window.supabase.createClient(
            SUPABASE_URL,
            SUPABASE_KEY,
            {
                global: {
                    headers: {
                        "x-tchit-key":
                            tchitAccessKey || ""
                    }
                }
            }
        );

    console.log(
        "T-chit: Supabase client initialized."
    );
}


initializeSupabaseClient();


function setTchitAccessKey(key) {

    tchitAccessKey = key;

    localStorage.setItem(
        TCHIT_KEY_STORAGE,
        key
    );

    initializeSupabaseClient();
}

let supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY,
        {
            global: {
                headers: {
                    "x-tchit-key":
                        tchitAccessKey || ""
                }
            }
        }
    );


console.log(
    "T-chit: Supabase client initialized."
);