import type { GetServerSideProps } from "next";
import fs from "fs";
import path from "path";

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const html = fs.readFileSync(path.join(process.cwd(), "index.html"), "utf8");
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.end(html);
  return { props: {} };
};

export default function Home() {
  return null;
}
