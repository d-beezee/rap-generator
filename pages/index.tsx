import Head from "next/head";
import React, { useState } from "react";
import styles from "./index.module.css";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string>();
  const [response, setResponse] = useState<string>();

  return (
    <div>
      <Head>
        <title>OpenAI Quickstart</title>
        <link rel="icon" href="/dog.png" />
      </Head>

      <main className={styles.main}>
        <img src="/dog.png" className={styles.icon} />
        <h3>Name my pet</h3>
        <form
          onSubmit={async (event) => {
            event.preventDefault();
            setIsLoading(true);
            try {
              const response = await fetch("/api/generate", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({}),
              });

              const data = await response.json();
              if (response.status !== 200) {
                throw (
                  data.error ||
                  new Error(`Request failed with status ${response.status}`)
                );
              }

              setResult(data.result);
              setResponse(JSON.stringify(data));
            } catch (error) {
              // Consider implementing your own error handling logic here
              console.error(error);
              alert(error.message);
            } finally {
              setIsLoading(false);
            }
          }}
        >
          <input
            disabled={isLoading}
            type="submit"
            value={isLoading ? "Loading" : "Generate"}
          />
        </form>
        <div className={styles.result}>
          <div style={{ whiteSpace: "pre-wrap" }}>{result}</div>
        </div>
      </main>
    </div>
  );
}
