// ----------------------------------------
// T-CHIT — SERVICE WORKER
// ----------------------------------------

const CACHE_NAME =
    "tchit-v2";

const APP_FILES = [
    "./",
    "./index.html",
    "./manifest.json"
];


self.addEventListener(
    "install",
    event => {

        event.waitUntil(

            caches
                .open(CACHE_NAME)
                .then(cache =>
                    cache.addAll(
                        APP_FILES
                    )
                )

        );

        self.skipWaiting();
    }
);


self.addEventListener(
	"activate",
	event => {

		event.waitUntil(

			caches
				.keys()
				.then(cacheNames =>
					Promise.all(
						cacheNames
							.filter(
								cacheName =>
									cacheName !== CACHE_NAME
							)
							.map(
								cacheName =>
									caches.delete(
										cacheName
									)
							)
					)
				)
				.then(() =>
					self.clients.claim()
				)

		);

	}
);


self.addEventListener(
    "fetch",
    event => {

        event.respondWith(

            fetch(event.request)
                .catch(() =>
                    caches.match(
                        event.request
                    )
                )

        );

    }
);