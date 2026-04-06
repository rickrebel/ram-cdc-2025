import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect, beforeEach, vi } from "vitest";
import BacteriaSearch from "~/components/inDRE/BacteriaChooser";
import { Bacteria } from "@prisma/client";

const mockBacteriaList: Bacteria[] = [
  { id: "1", bacteria: "Escherichia coli", nombreNormalizado: "EscherichiaColi", descripcion: "", table: 1 },
  { id: "2", bacteria: "Staphylococcus aureus", nombreNormalizado: "StaphylococcusAureus", descripcion: "", table: 2 },
  { id: "3", bacteria: "Pseudomonas aeruginosa", nombreNormalizado: "PseudomonasAeruginosa", descripcion: "", table: 3 },
];

describe("BacteriaSearch Component", () => {
  let handleBacteriaSelection: ReturnType<typeof vi.fn>;
  let setSelectedBacteria: ReturnType<typeof vi.fn>;
  let setFilteredBacteria: ReturnType<typeof vi.fn>;
  let removeSelectedBacteria: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    handleBacteriaSelection = vi.fn();
    setSelectedBacteria = vi.fn();
    setFilteredBacteria = vi.fn();
    removeSelectedBacteria = vi.fn();
  });

  const renderComponent = (
    selectedBacteria: string = "",
    filteredBacteria: Bacteria[] = mockBacteriaList
  ) => {
    render(
      <BacteriaSearch
        handleBacteriaSelection={handleBacteriaSelection}
        availableBacteria={mockBacteriaList}
        selectedBacteria={selectedBacteria}
        setSelectedBacteria={setSelectedBacteria}
        filteredBacteria={filteredBacteria}
        setFilteredBacteria={setFilteredBacteria}
        removeSelectedBacteria={removeSelectedBacteria}
      />
    );
  };

  it("renders input and dropdown when typing", () => {
    renderComponent();
    const input = screen.getByTestId("bacteria-input");
    fireEvent.change(input, { target: { value: "Escherichia coli" } });
    expect(input).toBeInTheDocument();
    expect(screen.getByTestId("bacteria-dropdown")).toBeVisible();
  });

  it("calls setSelectedBacteria on bacteria selection", () => {
    renderComponent();
    const input = screen.getByTestId("bacteria-input");
    fireEvent.change(input, { target: { value: "Escherichia coli" } });
    const option = screen.getByTestId("bacteria-option-1");
    fireEvent.click(option);
    expect(handleBacteriaSelection).toHaveBeenCalledWith("Escherichia coli");
  });

  it("displays selected bacteria", () => {
    renderComponent("Escherichia coli");
    expect(screen.getByText("Escherichia coli")).toBeInTheDocument();
    const selectedBacteria = screen.getByTestId("selected-bacteria");
    expect(selectedBacteria).toBeInTheDocument();
  });

  it("deselect then reselect bacteria", () => {
    renderComponent("Escherichia coli");
    const deselectButton = screen.getByTestId("deselect-bacteria");
    fireEvent.click(deselectButton);
    expect(removeSelectedBacteria).toHaveBeenCalled();
    const input = screen.getByTestId("bacteria-input");
    fireEvent.change(input, { target: { value: "Escherichia coli" } });
    const option = screen.getByTestId("bacteria-option-1");
    fireEvent.click(option);
    expect(handleBacteriaSelection).toHaveBeenCalledWith("Escherichia coli");
  });

  it("toggles dropdown visibility on input click", () => {
    renderComponent();
    const input = screen.getByTestId("bacteria-input");
    fireEvent.click(input);
    expect(screen.getByTestId("bacteria-dropdown")).toBeVisible();
    fireEvent.click(input);
    expect(screen.queryByTestId("bacteria-dropdown")).not.toBeInTheDocument();
  });

  it("does not call setSelectedBacteria for invalid bacteria", () => {
    renderComponent();
    const input = screen.getByTestId("bacteria-input");
    fireEvent.change(input, { target: { value: "Unknown" } });
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });
    expect(handleBacteriaSelection).not.toHaveBeenCalled();
  });

  it("hides dropdown when input is cleared", () => {
    renderComponent();
    const input = screen.getByTestId("bacteria-input");
    fireEvent.change(input, { target: { value: "" } });
    expect(screen.queryByTestId("bacteria-dropdown")).not.toBeInTheDocument();
  });

  it("hides dropdown when clicking outside the component", () => {
    renderComponent();
    const input = screen.getByTestId("bacteria-input");
    fireEvent.click(input);
    fireEvent.mouseDown(document.body);
    expect(screen.queryByTestId("bacteria-dropdown")).not.toBeInTheDocument();
  });

  it("deselects a selected bacteria", () => {
    renderComponent("Escherichia coli");
    const deselectButton = screen.getByTestId("deselect-bacteria");
    fireEvent.click(deselectButton);
    expect(removeSelectedBacteria).toHaveBeenCalled();
  });

  it("disables the input when a bacteria is selected", async () => {
    renderComponent("Escherichia coli");
    const input = screen.getByTestId("bacteria-input");
    await waitFor(() => {
      expect(input).toHaveAttribute("disabled");
    });
  });
});
