import MainPageView from "views/main-page-view";

export type TBars= {
  Time: number;
  Open: number;
  High: number;
  Low: number;
  Close: number;
  TickVolume: number;
}[];

export type ChartData = {
  ChunkStart: number;
  Bars: TBars
}[];

export default async function Home() {
  const myDataQ = await fetch(
    "https://beta.forextester.com/data/api/Metadata/bars/chunked?Broker=Advanced&Symbol=EURUSD&Timeframe=1&Start=57674&End=59113&UseMessagePack=false"
  );
  const data = await myDataQ.json();

  return <MainPageView data={data} />;
}
