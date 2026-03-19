import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { LoginScreen } from "@/components/LoginScreen";

describe("LoginScreen", () => {
  it("shows an error for invalid credentials", async () => {
    const onLogin = vi.fn().mockReturnValue(false);
    render(<LoginScreen onLogin={onLogin} />);

    await userEvent.type(screen.getByLabelText("Username"), "wrong");
    await userEvent.type(screen.getByLabelText("Password"), "creds");
    await userEvent.click(screen.getByRole("button", { name: /sign in/i }));

    expect(onLogin).toHaveBeenCalledWith("wrong", "creds");
    expect(screen.getByRole("alert")).toHaveTextContent(/invalid credentials/i);
  });

  it("clears the error on success", async () => {
    const onLogin = vi.fn().mockReturnValue(true);
    render(<LoginScreen onLogin={onLogin} />);

    await userEvent.type(screen.getByLabelText("Username"), "user");
    await userEvent.type(screen.getByLabelText("Password"), "password");
    await userEvent.click(screen.getByRole("button", { name: /sign in/i }));

    expect(onLogin).toHaveBeenCalledWith("user", "password");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
