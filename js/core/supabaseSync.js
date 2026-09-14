// ----------------------------------------
// T-CHIT — SUPABASE SYNC
// ----------------------------------------

const SupabaseSync = {

    DATA_ID: "tchit_main",

    async load() {

        try {

            const { data, error } =
                await supabaseClient
                    .from("app_data")
                    .select("data, updated_at")
                    .eq("id", this.DATA_ID)
                    .maybeSingle();

            if (error) {
                throw error;
            }

            if (!data) {
                console.log(
                    "T-chit Supabase: no remote data found."
                );

                return null;
            }

            console.log(
                "T-chit Supabase: remote data loaded."
            );

            return {
                data: data.data,
                updatedAt: data.updated_at
            };

        } catch (error) {

            console.error(
                "T-chit Supabase: failed to load data.",
                error
            );

            return null;
        }
    },

    async save(data) {

        try {

            const { data: result, error } =
                await supabaseClient
                    .from("app_data")
                    .upsert({
                        id: this.DATA_ID,
                        data,
                        updated_at:
                            new Date().toISOString()
                    })
                    .select("id, updated_at")
                    .single();

            if (error) {
                throw error;
            }

            console.log(
                "T-chit Supabase: data saved.",
                result
            );

            return result;

        } catch (error) {

            console.error(
                "T-chit Supabase: failed to save data.",
                error
            );

            return null;
        }
    }
};