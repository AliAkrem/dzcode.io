import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Locale, useLocale } from "./locale";
import { useSearch } from "src/utils/search";
import { useSearchModal } from "src/utils/search-modal";
import { ContributionCard } from "./contribution-card";
import { ContributorCard } from "./contributor-card";
import { ProjectCard } from "./project-card";
import { GetContributionsResponse } from "@dzcode.io/api/dist/contribution/types";
import { GetContributorsResponse } from "@dzcode.io/api/dist/contributor/types";
import { GetProjectsResponse } from "@dzcode.io/api/dist/project/types";

export function Search(): JSX.Element {
  const { localize } = useLocale();
  const [query, setQuery] = useState("");

  const { results, isFetching } = useSearch(query);

  const { hideModal, showModal } = useSearchModal();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "/") {
        event.preventDefault();
        showModal();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [showModal]);

  const onSearchInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  }, []);

  const projectsList = useMemo(() => {
    return (
      results
        .filter((result) => result.indexUid === "project")
        // @TODO-OB: fix type casting
        .flatMap((projects) => projects.hits) as unknown as Array<
        GetProjectsResponse["projects"][number]
      >
    );
  }, [results]);

  const contributorsList = useMemo(() => {
    return (
      results
        .filter((result) => result.indexUid === "contributor")
        // @TODO-OB: fix type casting
        .flatMap((contributors) => contributors.hits) as unknown as Array<
        GetContributorsResponse["contributors"][number]
      >
    );
  }, [results]);

  const contributionsList = useMemo(() => {
    return (
      results
        .filter((result) => result.indexUid === "contribution")
        // @TODO-OB: fix type casting
        .flatMap((contributions) => contributions.hits) as unknown as Array<
        GetContributionsResponse["contributions"][number]
      >
    );
  }, [results]);

  const searchTextOutput = useMemo(() => {
    if (isFetching) {
      return "";
    }
    if (query === "") {
      return localize("search-type-to-search");
    }
    if (
      projectsList.length === 0 &&
      contributorsList.length === 0 &&
      contributionsList.length === 0
    ) {
      return localize("search-no-results-found");
    }
    return "";
  }, [
    isFetching,
    query,
    projectsList.length,
    contributorsList.length,
    contributionsList.length,
    localize,
  ]);

  return (
    <dialog id="search-modal" className="modal">
      <div className="modal-box w-11/12 max-w-5xl h-[80vh] flex flex-col">
        <label className="input input-bordered flex items-center gap-2 bg-neutral sticky top-0 z-10">
          <input
            type="text"
            className="grow h-12"
            placeholder={localize("navbar-section-search")}
            onChange={onSearchInputChange}
          />
          {isFetching ? (
            <span className="loading loading-dots loading-lg"></span>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
              fill="currentColor"
              className="h-4 w-4 opacity-70"
            >
              <path
                fillRule="evenodd"
                d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </label>
        <div className="overflow-y-auto flex-grow">
          {searchTextOutput && (
            <div className="flex justify-center items-center h-full">
              <p>{searchTextOutput}</p>
            </div>
          )}
          {contributionsList?.length > 0 && (
            <div className="mt-4">
              <h3 className="text-lg font-bold">
                <Locale search-contributions />
              </h3>
              <div className="flex flex-row flex-wrap gap-4 justify-center p-4 max-w-7xl">
                {contributionsList.map((contribution) => (
                  <ContributionCard
                    contribution={contribution}
                    key={contribution.id}
                    compact
                    onClick={hideModal}
                  />
                ))}
              </div>
            </div>
          )}
          {contributorsList?.length > 0 && (
            <div className="mt-4">
              <h3 className="text-lg font-bold">
                <Locale search-contributors />
              </h3>
              <div className="flex flex-row flex-wrap gap-4 justify-between p-4 max-w-7xl">
                {contributorsList.map((contributor) => (
                  <ContributorCard
                    contributor={contributor}
                    key={contributor.id}
                    compact
                    onClick={hideModal}
                  />
                ))}
              </div>
            </div>
          )}
          {projectsList?.length > 0 && (
            <div className="mt-4">
              <h3 className="text-lg font-bold">
                <Locale search-projects />
              </h3>
              <div className="flex flex-row flex-wrap gap-4 justify-between p-4 max-w-7xl">
                {projectsList.map((project) => (
                  <ProjectCard project={project} key={project.id} compact onClick={hideModal} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
}
