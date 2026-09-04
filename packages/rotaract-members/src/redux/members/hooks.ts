"use client";

import { useSelector } from "react-redux";
import {
  selectMembers,
  selectMembersError,
  selectMembersStatus,
} from "./reduce";

export function useMembers() {
  return useSelector(selectMembers);
}

export function useMembersStatus() {
  return useSelector(selectMembersStatus);
}

export function useMembersError() {
  return useSelector(selectMembersError);
}
