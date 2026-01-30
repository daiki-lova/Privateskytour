import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Course } from "@/lib/data/types";

// Mock motion/react to avoid animation issues
vi.mock("motion/react", () => ({
  motion: {
    div: ({
      children,
      ...props
    }: React.PropsWithChildren<Record<string, unknown>>) => (
      <div {...props}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
}));

// Mock i18n TranslationContext
vi.mock("@/lib/i18n/TranslationContext", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    locale: "ja",
  }),
}));

// Override next/navigation mock to capture push calls
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
}));

// Mock child step components
vi.mock("../Step1PlanSelection", () => ({
  Step1PlanSelection: ({
    data,
    updateData,
    onNext,
  }: {
    data: Record<string, unknown>;
    updateData: (d: Record<string, unknown>) => void;
    onNext: () => void;
    courses: Course[];
  }) => (
    <div data-testid="step1">
      <span data-testid="step1-planid">{String(data.planId || "none")}</span>
      <span data-testid="step1-passengers">{String(data.passengers)}</span>
      <span data-testid="step1-requesttransfer">
        {String(data.requestTransfer)}
      </span>
      <span data-testid="step1-guests">
        {JSON.stringify(data.guests)}
      </span>
      <button data-testid="step1-next" onClick={onNext}>
        Next
      </button>
      <button
        data-testid="step1-update"
        onClick={() => updateData({ planId: "updated-plan" })}
      >
        Update
      </button>
    </div>
  ),
}));

vi.mock("../Step2PassengerDetails", () => ({
  Step2PassengerDetails: ({
    data,
    updateData,
    onNext,
  }: {
    data: Record<string, unknown>;
    updateData: (d: Record<string, unknown>) => void;
    onNext: () => void;
    courses: Course[];
  }) => (
    <div data-testid="step2">
      <span data-testid="step2-planid">{String(data.planId || "none")}</span>
      <button data-testid="step2-next" onClick={onNext}>
        Next
      </button>
      <button
        data-testid="step2-update"
        onClick={() => updateData({ contactName: "Taro" })}
      >
        Update
      </button>
    </div>
  ),
}));

vi.mock("../Step3Confirmation", () => ({
  Step3Confirmation: ({
    data,
  }: {
    data: Record<string, unknown>;
    onClose: () => void;
    courses: Course[];
  }) => (
    <div data-testid="step3">
      <span data-testid="step3-planid">{String(data.planId || "none")}</span>
      <span data-testid="step3-contactname">
        {String(data.contactName || "none")}
      </span>
    </div>
  ),
}));

// Lazy import after mocks are set up
import { BookingWizard } from "../BookingWizard";

const mockCourses: Course[] = [
  {
    id: "course-1",
    title: "Tokyo Sky Tour",
    price: 50000,
    durationMinutes: 15,
    maxPax: 3,
    description: "Tokyo sightseeing tour",
    highlights: ["Tokyo Tower", "Skytree"],
    images: ["/images/tour1.jpg"],
    displayOrder: 1,
    isActive: true,
  },
];

describe("BookingWizard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders step 1 by default", () => {
    render(<BookingWizard courses={mockCourses} />);
    expect(screen.getByTestId("step1")).toBeInTheDocument();
    expect(screen.queryByTestId("step2")).not.toBeInTheDocument();
    expect(screen.queryByTestId("step3")).not.toBeInTheDocument();
  });

  it("shows 3 step indicators with step 1 active", () => {
    render(<BookingWizard courses={mockCourses} />);
    // Step indicators render labels via t() which returns the key
    expect(screen.getByText("booking.step1.label")).toBeInTheDocument();
    expect(screen.getByText("booking.step2.label")).toBeInTheDocument();
    expect(screen.getByText("booking.step3.label")).toBeInTheDocument();
  });

  it("includes initialPlanId in bookingData when provided", () => {
    render(
      <BookingWizard courses={mockCourses} initialPlanId="plan-abc" />
    );
    expect(screen.getByTestId("step1-planid")).toHaveTextContent("plan-abc");
  });

  it("uses correct default bookingData values", () => {
    render(<BookingWizard courses={mockCourses} />);
    expect(screen.getByTestId("step1-planid")).toHaveTextContent("none");
    expect(screen.getByTestId("step1-passengers")).toHaveTextContent("2");
    expect(screen.getByTestId("step1-requesttransfer")).toHaveTextContent(
      "false"
    );
    expect(screen.getByTestId("step1-guests")).toHaveTextContent("[]");
  });

  it("renders Step1PlanSelection with courses prop", () => {
    render(<BookingWizard courses={mockCourses} />);
    expect(screen.getByTestId("step1")).toBeInTheDocument();
  });

  it("calls router.push('/') when back button is clicked on step 1", () => {
    render(<BookingWizard courses={mockCourses} />);
    // The back button renders t('common.back') as text
    const backButtons = screen.getAllByText("common.back");
    fireEvent.click(backButtons[0]);
    expect(mockPush).toHaveBeenCalledWith("/");
  });

  it("navigates to step 2 when onNext is called from step 1", () => {
    render(<BookingWizard courses={mockCourses} />);
    fireEvent.click(screen.getByTestId("step1-next"));
    expect(screen.queryByTestId("step1")).not.toBeInTheDocument();
    expect(screen.getByTestId("step2")).toBeInTheDocument();
  });

  it("navigates back to step 1 from step 2 via back button", () => {
    render(<BookingWizard courses={mockCourses} />);
    // Go to step 2
    fireEvent.click(screen.getByTestId("step1-next"));
    expect(screen.getByTestId("step2")).toBeInTheDocument();

    // Click back button (ArrowLeft on step 2)
    const backButtons = screen.getAllByText("common.back");
    fireEvent.click(backButtons[0]);
    expect(screen.getByTestId("step1")).toBeInTheDocument();
    expect(screen.queryByTestId("step2")).not.toBeInTheDocument();
  });

  it("persists bookingData updates when navigating between steps", () => {
    render(<BookingWizard courses={mockCourses} />);

    // Update data in step 1
    fireEvent.click(screen.getByTestId("step1-update"));
    expect(screen.getByTestId("step1-planid")).toHaveTextContent(
      "updated-plan"
    );

    // Navigate to step 2
    fireEvent.click(screen.getByTestId("step1-next"));
    expect(screen.getByTestId("step2-planid")).toHaveTextContent(
      "updated-plan"
    );

    // Navigate back to step 1 - data should still be there
    const backButtons = screen.getAllByText("common.back");
    fireEvent.click(backButtons[0]);
    expect(screen.getByTestId("step1-planid")).toHaveTextContent(
      "updated-plan"
    );
  });

  it("renders Step3Confirmation at step 3", () => {
    render(<BookingWizard courses={mockCourses} />);

    // Step 1 -> Step 2
    fireEvent.click(screen.getByTestId("step1-next"));
    expect(screen.getByTestId("step2")).toBeInTheDocument();

    // Step 2 -> Step 3
    fireEvent.click(screen.getByTestId("step2-next"));
    expect(screen.queryByTestId("step2")).not.toBeInTheDocument();
    expect(screen.getByTestId("step3")).toBeInTheDocument();
  });
});
