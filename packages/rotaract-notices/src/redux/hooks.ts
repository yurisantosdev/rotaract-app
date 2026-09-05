"use client";

import { useSelector } from "react-redux";
import {
  selectNotices,
  selectNoticesError,
  selectNoticesStatus,
} from "./reduce";

export function useNotices() {
  return useSelector(selectNotices);
}

export function useNoticesStatus() {
  return useSelector(selectNoticesStatus);
}

export function useNoticesError() {
  return useSelector(selectNoticesError);
}
