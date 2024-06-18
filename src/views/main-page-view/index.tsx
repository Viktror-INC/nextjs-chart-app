"use client";
import React from "react";
import Chart from "features/chart";
import { ChartData } from "src/app/page";

type TProps = {
  data: ChartData;
};

const MainPageView = (props: TProps) => {
  const { data } = props;
  return <Chart data={data} />;
};

export default MainPageView;
