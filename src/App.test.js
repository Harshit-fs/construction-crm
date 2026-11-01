import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import axios from "axios";
import Navbar from "./Component/Navbar";

const mockNavigate = jest.fn();

jest.mock("axios");
jest.mock("react-router-dom", () => ({
  NavLink: ({ to, className, children, ...props }) => {
    const resolvedClassName =
      typeof className === "function" ? className({ isActive: false }) : className;

    return (
      <a
        href={to}
        className={resolvedClassName}
        {...props}
        onClick={(event) => {
          event.preventDefault();
          props.onClick?.(event);
        }}
      >
        {children}
      </a>
    );
  },
  useNavigate: () => mockNavigate,
}));

beforeEach(() => {
  mockNavigate.mockClear();
  localStorage.clear();
  axios.get.mockResolvedValue({ data: [] });
});

test("Create menu opens and closes after selecting an action", async () => {
  render(<Navbar />);

  const createButton = screen.getByRole("button", { name: /create/i });
  expect(createButton).toHaveAttribute("aria-expanded", "false");

  fireEvent.click(createButton);
  expect(createButton).toHaveAttribute("aria-expanded", "true");

  const newLeadLink = screen.getByRole("link", { name: /new lead/i });
  expect(newLeadLink).toHaveAttribute("href", "/leads");

  fireEvent.click(newLeadLink);
  await waitFor(() => {
    expect(createButton).toHaveAttribute("aria-expanded", "false");
  });
});

test("Profile menu opens and logout clears the session and returns to login", () => {
  localStorage.setItem(
    "user",
    JSON.stringify({
      name: "Test User",
      email: "test@example.com",
      role: "Super Admin",
      permissions: [],
    })
  );

  render(<Navbar />);

  const profileButton = screen.getByRole("button", { name: /test user/i });
  expect(profileButton).toHaveAttribute("aria-expanded", "false");

  fireEvent.click(profileButton);
  expect(profileButton).toHaveAttribute("aria-expanded", "true");

  fireEvent.click(screen.getByRole("button", { name: /logout/i }));

  expect(localStorage.getItem("user")).toBeNull();
  expect(mockNavigate).toHaveBeenCalledWith("/login");
  expect(screen.getByRole("link", { name: /login/i })).toHaveAttribute(
    "href",
    "/login"
  );
});

test("Navbar shows a login link when no user is signed in", () => {
  render(<Navbar />);

  expect(screen.getByRole("link", { name: /login/i })).toHaveAttribute(
    "href",
    "/login"
  );
});
