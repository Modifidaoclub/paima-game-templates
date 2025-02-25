import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from "@mui/material";
import Navbar from "@src/components/Navbar";
import SearchBar from "@src/components/SearchBar";
import Wrapper from "@src/components/Wrapper";
import Button from "@src/components/Button";
import { formatDate } from "@src/utils";
import { useGlobalStateContext } from "@src/GlobalStateContext";
import type { IGetLobbyByIdResult } from "@cards/db";
import { useNavigate } from "react-router-dom";
import { Page } from "@src/pages/PageCoordinator";
import { getOpenLobbies, joinLobby, searchLobby } from "@src/services/utils";
import { useDebounce } from 'use-debounce';

type Column = {
  id: keyof IGetLobbyByIdResult | "action";
  label: string;
  minWidth: number;
};

const columns: Column[] = [
  { id: "lobby_id", label: "Lobby ID", minWidth: 50 },
  { id: "created_at", label: "Created At", minWidth: 50 },
  { id: "action", label: "", minWidth: 50 },
];

const expandValue = (id: keyof IGetLobbyByIdResult, value: unknown) => {
  if (id === "created_at" && typeof value === "string") {
    return formatDate(value);
  }
  if (typeof value === "string") {
    return value;
  }
  return null;
};

const OpenLobbies: React.FC = () => {
  const navigate = useNavigate();
  const {
    selectedNftState: [selectedNft],
    selectedDeckState: [selectedDeck],
    collection,
    joinedLobbyRawState: [, setJoinedLobbyRaw],
  } = useGlobalStateContext();
  const [lobbies, setLobbies] = useState<IGetLobbyByIdResult[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchText, setSearchText] = useState("");
  const [debounceSearchText] = useDebounce(searchText, 1000);
  useEffect(() => {
    (async () => {
      if (selectedNft.nft == null) return;

      const results = await searchLobby(selectedNft.nft, debounceSearchText, 0);
      if (results == null || results.length === 0) return;
      const newLobbies = results.filter(
        (result) => !lobbies.some((lobby) => lobby.lobby_id === result.lobby_id)
      );
      setLobbies([...lobbies, ...newLobbies]);
    })()
  }, [debounceSearchText])

  useEffect(() => {
    if (selectedNft.nft == null) return;

    getOpenLobbies(selectedNft.nft).then((lobbies) => {
      setLobbies(lobbies);
    });
  }, [selectedNft.nft]);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleLobbiesRefresh = async () => {
    if (selectedNft.nft == null) return;

    const lobbies = await getOpenLobbies(selectedNft.nft);

    setPage(0);
    setSearchText("");
    setLobbies(lobbies);
  };

  const filteredLobbies = lobbies.filter((lobby) => {
    const rowValues = Object.values(lobby).join("");
    if (rowValues == null) return false;
    return rowValues.toLowerCase().includes(searchText.toLowerCase());
  });

  return (
    <>
      <Navbar>
        <SearchBar
          value={searchText}
          onRefresh={handleLobbiesRefresh}
          onSearch={setSearchText}
        />
      </Navbar>
      <Wrapper>
        <TableContainer>
          <Table stickyHeader aria-label="sticky table">
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell
                    key={column.id}
                    align={"left"}
                    style={{ minWidth: column.minWidth }}
                  >
                    {column.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredLobbies.length === 0 && (
                <TableRow
                  hover
                  role="checkbox"
                  tabIndex={-1}
                >
                  <TableCell colSpan={columns.length}>
                    <Typography sx={{ textAlign: "center", marginTop: 4, marginBottom: 4}}>
                      No open lobbies at this time. Create your own or play against an AI
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
              {filteredLobbies
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((lobby) => {
                  return (
                    <TableRow
                      hover
                      role="checkbox"
                      tabIndex={-1}
                      key={lobby.lobby_id}
                    >
                      {columns.map((column) => {
                        return (
                          <TableCell key={column.id} align="left">
                            {column.id === "action" ? (
                              <Button
                                onClick={async () => {
                                  if (
                                    collection.cards == null ||
                                    selectedNft.nft == null ||
                                    selectedDeck == null
                                  )
                                    return;

                                  const joinedLobby = await joinLobby(
                                    selectedNft.nft,
                                    selectedDeck.map((card) => {
                                      if (collection.cards?.[card] == null)
                                        throw new Error(
                                          `joinLobby: card not found in collection`
                                        );

                                      return {
                                        id: card,
                                        registryId:
                                          collection.cards[card].registry_id,
                                      };
                                    }),
                                    lobby.lobby_id
                                  );

                                  setJoinedLobbyRaw(joinedLobby);
                                  navigate(Page.Game);
                                }}
                              >
                                Enter
                              </Button>
                            ) : (
                              expandValue(column.id, lobby[column.id])
                            )}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredLobbies.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Wrapper>
    </>
  );
};

export default OpenLobbies;
